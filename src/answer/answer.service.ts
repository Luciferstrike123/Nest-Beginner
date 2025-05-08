import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from 'src/entities/answer.entity';
import { Question } from 'src/entities/question.entity';
import { QuestionOption } from 'src/entities/questions.option.entity';
import { Song } from 'src/entities/song.entity';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { CreateAnswerRequestDto } from './dto/request/create.answer.request.dto';
import { User } from 'src/entities/user.entity';
import { AnswerResponseDto } from './dto/response/answerResponse';
import { QuestionType } from 'src/entities/enums/question.type.enum';
import { OpenedAnswersPaginatedDto, StatisticResponseDto } from './dto/response/statisticResponse';

@Injectable()
export class AnswerService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Answer)
        private readonly answerRepo: Repository<Answer>,

        @InjectRepository(QuestionOption)
        private readonly questionOptionRepo: Repository<QuestionOption>,

        @InjectRepository(Question)
        private readonly questionRepo: Repository<Question>,

        @InjectRepository(Song)
        private readonly songRepo: Repository<Song>,

        private dataSource: DataSource,
    ) {}

    async createAnswer(createAnswerRequest: CreateAnswerRequestDto): Promise<AnswerResponseDto> {
        const { userId, songId, answers } = createAnswerRequest;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) return { code: 400, message: 'User not found' };

        const song = await this.songRepo.findOne({
            where: { id: songId },
            relations: ['questions', 'questions.questionOptions'],
        });
        if (!song) return { code: 400, message: 'Song not found' };

        // Check if user already answered this song
        const answeredCount = await this.answerRepo.count({
            where: { user: { id: userId }, questionOption: { question: { song: { id: songId } } } },
        });
        if (answeredCount > 0) {
            return { code: 409, message: 'User has already submitted answers for this song' };
        }

        const questions = song.questions;
        if (!questions.length) return { code: 400, message: 'No questions for this song' };

        // Build map for O(1) access
        const questionMap = new Map<number, Question>(questions.map(q => [q.id, q]));
        const songIds = new Set(questionMap.keys());
        const submittedIds = answers.map(a => a.questionId);

        // Validate IDs set membership in one pass
        const invalidIds = submittedIds.filter(id => !songIds.has(id));
        if (invalidIds.length) return { code: 400, message: `Invalid question IDs: ${invalidIds.join(', ')}` };

        const missingIds = Array.from(songIds).filter(id => !submittedIds.includes(id));
        if (missingIds.length) return { code: 400, message: `Missing answers for questions: ${missingIds.join(', ')}` };

        // Prepare answer entities
        const entities: Answer[] = [];

        for (const { questionId, questionOptionId, openedAnswer } of answers) {
            const q = questionMap.get(questionId)!;
            const opts = q.questionOptions;
            switch (q.type) {
                case QuestionType.OPEN_ENDED:
                    if (!openedAnswer?.trim())
                        return { code: 400, message: `Answer required for Q${questionId}` };
                    entities.push(Object.assign(new Answer(), { user, questionId, openedAnswer }));
                    break;
                case QuestionType.SINGLE_CHOICE:
                case QuestionType.YES_NO: {
                    const optId = questionOptionId as number;
                    if (!opts.some(o => o.id === optId))
                        return { code: 400, message: `Invalid option ${optId} for Q${questionId}` };
                    const e = new Answer(); e.user = user; e.questionOption = opts.find(o => o.id === optId)!; e.questionId = questionId;
                    entities.push(e);
                    break;
                }
                case QuestionType.MULTIPLE_CHOICE:{
                    const ids = Array.isArray(questionOptionId) ? questionOptionId : [];
                    if (!ids.length)
                        return { code: 400, message: `Choose at least one option for Q${questionId}` };
                    for (const id of ids){
                        if (!opts.some(o => o.id === id))
                            return { code: 400, message: `Invalid option ${id} for Q${questionId}` };
                        const e = new Answer(); e.user = user; e.questionOption = opts.find(o => o.id === id)!; e.questionId = questionId;
                        entities.push(e);
                    }
                    break;
                }
                case QuestionType.RATING_SCALE:{
                    const optId = questionOptionId as number;
                    if (typeof optId !== 'number' || !opts.some(o => o.id === optId)) {
                        return {
                          code: 400,
                          message: `Invalid rating option ID ${optId} for question ${questionId}`,
                        };
                    }
                    const selected = opts.find(o => o.id === optId)!;
                    const e = new Answer();
                    e.user = user;
                    e.questionOption = selected;
                    e.questionId = questionId;
                    entities.push(e);
                    break;
                }
                default:
                    return { code: 400, message: `Unsupported type: ${q.type}` };
            }
        }
        try{
            await this.dataSource.transaction(async manager => {
                const answerRepoWithTransaction = manager.getRepository(Answer);
                await answerRepoWithTransaction.save(entities);
            });
            await this.userRepo.update(userId, {
                totalScore: () => 'totalScore + 1',
            });

            return { code: 201, message: 'Answers saved successfully' };
        } catch (err) {
            console.error(err);
            return { code: 500, message: `Save error: ${err.message}` };
        }
    }

    async getStatistic(songId: string): Promise<StatisticResponseDto> {
        const song = await this.songRepo.findOne({
            where: { id: songId },
            relations: ['questions', 'questions.questionOptions'],
        });
        if (!song) return { code: 400, message: 'Song not found' };

        // Get total participants
        const questionIds = song.questions.map(q => q.id);
        if (!questionIds.length) {
            return {
              code: 200,
              message: 'No questions for this song',
              data: { songId, totalParticipants: 0, questionStatistics: [] },
            };
        }

        // 1. Total participants (distinct users)
        const totalParticipantsRaw = await this.answerRepo
            .createQueryBuilder('a')
            .select('COUNT(DISTINCT a.userId)', 'count')
            .where('a.questionId IN (:...questionIds)', { questionIds })
            .getRawOne();
        const totalParticipants = Number(totalParticipantsRaw.count) || 0;
        
        // 2. Total answers per question (group by question)
        const totalByQuestion = await this.answerRepo
        .createQueryBuilder('a')
        .select('a.questionId', 'questionId')
        .addSelect('COUNT(*)', 'total')
        .where('a.questionId IN (:...questionIds)', { questionIds })
        .groupBy('a.questionId')
        .getRawMany();
        const totalMap = new Map<number, number>(
            totalByQuestion.map(r => [Number(r.questionId), Number(r.total)])
        );

        // 3. Open answers count per question
        const openByQuestion = await this.answerRepo
        .createQueryBuilder('a')
        .select('a.questionId', 'questionId')
        .addSelect('COUNT(*)', 'openCount')
        .where('a.questionId IN (:...questionIds)', { questionIds })
        .andWhere('a.openedAnswer IS NOT NULL')
        .groupBy('a.questionId')
        .getRawMany();
        const openMap = new Map<number, number>(
            openByQuestion.map(r => [Number(r.questionId), Number(r.openCount)])
        );

        // 4. Options statistics (group by option)
        const optionIds = song.questions.flatMap(q => q.questionOptions.map(o => o.id));
        let optionStatsRaw: { questionOptionId: number; count: string }[] = [];
        if (optionIds.length) {
            optionStatsRaw = await this.answerRepo
            .createQueryBuilder('a')
            .select('a.questionOptionId', 'questionOptionId')
            .addSelect('COUNT(*)', 'count')
            .where('a.questionOptionId IN (:...optionIds)', { optionIds })
            .groupBy('a.questionOptionId')
            .getRawMany();
        }
        const optionMap = new Map<number, number>(
            optionStatsRaw.map(r => [Number(r.questionOptionId), Number(r.count)])
        );

        // 5. Build statistics array
        const questionStatistics = song.questions
            .sort((a, b) => a.id - b.id)
            .map(q => {
                const totalAnswers = totalMap.get(q.id) ?? 0;
                const openAnswerCount = openMap.get(q.id) ?? 0;
                const optionsStatistics = q.questionOptions
                    .sort((a, b) => a.id - b.id)
                    .map(opt => ({
                        optionId: opt.id,
                        optionText: opt.option,
                        totalAnswers: optionMap.get(opt.id) ?? 0,
                    }));

                return {
                    questionId: q.id,
                    question: q.question,
                    questionType: q.type,
                    totalAnswers,
                    openAnswerCount,
                    optionsStatistics,
                };
            });

        return {
            code: 200,
            message: 'Statistics retrieved successfully',
            data: {
                songId,
                totalParticipants,
                questionStatistics,
            },
        };
    }

    async getOpenedAnswersPaginated(questionId: number, page: number, limit: number): Promise<OpenedAnswersPaginatedDto> {
        const question = await this.questionRepo.findOne({
            where: { id: questionId },
        });
        if (!question) return { code: 400, message: 'Question not found' };

        const totalItems = await this.answerRepo.count({
            where: { questionId, openedAnswer: Not(IsNull()) },
        });
        if (totalItems === 0) return { code: 200, message: 'No opened answers found' };

        const answers = await this.answerRepo.find({
            where: { questionId: questionId, openedAnswer: Not(IsNull()) },
            select: ['openedAnswer'],
            skip: (page - 1) * limit,
            take: limit,
            order: { id: 'ASC' },
        });

        const openedAnswers = answers.map(a => a.openedAnswer!);

        return {
            code: 200,
            message: 'Opened answers retrieved successfully',
            data: {
                questionId,
                question: question.question,
                openedAnswers,
                pagination: {
                    page,
                    limit,
                    totalItems,
                    totalPages: Math.ceil(totalItems / limit),
                },
            },
        };
    }
}