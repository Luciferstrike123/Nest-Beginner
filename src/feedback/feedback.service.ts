import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Question } from 'src/entities/question.entity';
import { QuestionOption } from 'src/entities/questions.option.entity';
import { CreateFeedBackRequestDTO } from './dto/request/createFeedback.dto.request';
import { CreateFeedBackResponseDTO } from './dto/response/createFeedback.dto.response'; 
import { QuestionType } from 'src/entities/enums/question.type.enum';
import { Song } from 'src/entities/song.entity';
import { GetFeedbackResponseDTO } from './dto/response/getFeedback.dto.response';
import { QuestionItemDTO } from './dto/request/questionItem.dto';
import { DeleteQuestionsDto } from './dto/request/deleteQuestion.dto.request';
import { DeleteOptionsDto } from './dto/request/deleteOption.dto.request';
import { AddNewOptions } from './dto/request/addNewOptions.dto.request';
import { User } from 'src/entities/user.entity';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Question)
        private questionRepo: Repository<Question>,

        @InjectRepository(QuestionOption)
        private questionOptionRepo: Repository<QuestionOption>,

        @InjectRepository(Song)
        private songRepo: Repository<Song>,

        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}
    
    async create(userId: string, feedbackDto: CreateFeedBackRequestDTO): Promise<CreateFeedBackResponseDTO> {
        const id_song = feedbackDto.id_song;
        const song = await this.songRepo.findOne({
            where: {id: id_song},
            relations: ['author'],
        });
        if (!song) {
            throw new NotFoundException(`Song with ID ${id_song} not found`);
        }
        const user = await this.userRepo.findOne({where: {id: userId}});
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if(song.author.id !== userId) {
            return {
                code: 403,
                message: 'You are not authorized to create feedback for this song',
            };
        }

        const questionCount = await this.questionRepo.count({
            where: { song: { id: id_song } },
        });
        if (questionCount > 0) {
            return {
                code: 999,
                message: 'Feedback of this song already exists',
            };
        }          

        for (const item of feedbackDto.questions){
            const { type, question, options } = item;

            const newQuestion = new Question();
            newQuestion.type = type;
            newQuestion.question = question;
            newQuestion.song = song;

            const savedQuestion = await this.questionRepo.save(newQuestion);

            if (options && options.length > 0){
                const questionOptions = options.map((option) => {
                    const newOption = new QuestionOption;
                    newOption.question = savedQuestion;
                    newOption.option = option;
                    return newOption;
                })

                const savedOptions = await this.questionOptionRepo.save(questionOptions);
                savedQuestion.questionOptions = savedOptions;
            }
        }

        return {
            code: 201,
            message: "Feedback created successfully",
        }
    }

    async find(id_song: string): Promise<GetFeedbackResponseDTO>{
        try{
            const song = await this.songRepo.findOne({
                where: { id: id_song },
                relations: ['questions', 'questions.questionOptions'], // Load cả questions và questionOptions
            });

            if (!song) {
                return {
                    code: 404,
                    message: `Song with ID ${id_song} not found`,
                    id_song: id_song,
                    questions: [],
                };
            }

            if (!song.questions || song.questions.length === 0) {
                return {
                    code: 200,
                    message: `No feedback found for song with ID ${id_song}`,
                    id_song: id_song,
                    questions: [],
                };
            }

            const questionItems: QuestionItemDTO[] = (song.questions || [])
                .sort((a, b) => a.id - b.id)
                .map((question) => ({
                    id: question.id,
                    question: question.question,
                    type: question.type,
                    options: (question.questionOptions || [])
                        .sort((a,b) => a.id - b.id)
                        .map((option) => ({
                            id: option.id,
                            option: option.option
                        })),
                }));

            return {
                code: 200,
                message: "Feedback retrieved successfully",
                id_song:id_song,
                questions: questionItems,
            }
        }
        catch(error){
            return {
                code: 500,
                message: `An error occurred: ${error.message}`,
                id_song: id_song,
                questions: [],
            };
        }
    }

    async delete(userId: string ,id_song: string): Promise<CreateFeedBackResponseDTO> {
        const song = await this.songRepo.findOne({where: {id: id_song}});
        if (!song) {
            throw new NotFoundException(`Song with ID ${id_song} not found`);
        }

        const user = await this.userRepo.findOne({where: {id: userId}});
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        if(song.author.id !== user.id) {
            return {
                code: 403,
                message: 'You are not authorized to delete feedback for this song',
            };
        }

        const oldQuestions = await this.questionRepo.find({
            where: { song: { id: id_song } },
            relations: ['questionOptions'],
        });

        //delete all old questions, cascade was used
        const allQuestionIds = oldQuestions.map(q => q.id);
        if(allQuestionIds.length > 0){
            await this.questionRepo.delete(allQuestionIds);
        }

        return {
            code: 200,
            message: "Feedback deleted successfully",
        }
    }

    async deleteQuestions(userId: string ,questions: DeleteQuestionsDto): Promise<CreateFeedBackResponseDTO> {
        try{
            const {questionIds} = questions;

            if(questionIds.length <= 0){
                throw new NotFoundException("The questionIds is empty");
            } else{
                await this.questionRepo.delete(questionIds);
            }

            const fountQuestions = await this.questionRepo.findBy({id: In(questionIds)});

            const unAuthorizedQuestions = fountQuestions.filter((question) => {
                const song = question.song;
                return song.author.id !== userId;
            });

            if (unAuthorizedQuestions.length > 0) {
                return {
                    code: 403,
                    message: 'You are not authorized to delete some of these questions',
                };
            }

            return{
                code: 200,
                message: "The feedback questions deleted successfully",
            }
        } catch(error){
            throw new Error(`failed to delete question: ${error.message}`);
        }
    }

    async deleteOptions(options: DeleteOptionsDto): Promise<CreateFeedBackResponseDTO> {
        try{
            const {optionIds} = options;

            if(optionIds.length <= 0) {
                throw new NotFoundException("The optionIds is empty");
            } else {
                await this.questionOptionRepo.delete(optionIds);
            }

            return {
                code: 200,
                message: "operations done well",
            }
        } catch(error){
            throw new Error(`failed to delete options: ${error.message}`);
        }
    }

    async addNewQuestions(newQuestions: CreateFeedBackRequestDTO): Promise<CreateFeedBackResponseDTO> {
        const id_song = newQuestions.id_song;
        const song = await this.songRepo.findOne({where: {id: id_song}});
        if (!song) {
            throw new NotFoundException(`Song with ID ${id_song} not found`);
        }

        for (const item of newQuestions.questions){
            const { type, question, options } = item;
            
            const newQuestion = new Question();
            newQuestion.type = type;
            newQuestion.question = question;
            newQuestion.song = song;

            const savedQuestion = await this.questionRepo.save(newQuestion);

            if (options && options.length > 0){
                const questionOptions = options.map((option) => {
                    const newOption = new QuestionOption;
                    newOption.question = savedQuestion;
                    newOption.option = option;
                    return newOption;
                });

                const savedOptions = await this.questionOptionRepo.save(questionOptions);
                savedQuestion.questionOptions = savedOptions;
            }
        }

        return {
            code: 201,
            message:"Add new questions successfully",
        }
    }

    async addNewOptions(newRequests: AddNewOptions): Promise<CreateFeedBackResponseDTO> {
        const {addOptions} = newRequests;

        for(const item of addOptions){
            const {id_question, newOptions} = item;

            const question = await this.questionRepo.findOne({where:{id: id_question}});
            if(!question){
                console.log("this id is not existed");
                continue;
            }

            if(question.type == QuestionType.OPEN_ENDED){
                console.log("no need to add options into OPEN_ENDED question.")
                continue;
            }
            
            if(newOptions && newOptions.length > 0){
                const questionOptions = newOptions.map((option) => {
                    const newOption = new QuestionOption;
                    newOption.question = question;
                    newOption.option = option;
                    return newOption;
                });

                const savedOptions = await this.questionOptionRepo.save(questionOptions);
                
                if (!question.questionOptions) {
                    question.questionOptions = [];
                }
                question.questionOptions.push(...savedOptions);
            }
        }

        return {
            code: 201,
            message: "Add new options successfully",
        }
    }

    async updateQuestion(id: number, updateData:{question: string}): Promise<CreateFeedBackResponseDTO> {
        try{
            const question = await this.questionRepo.findOne({where: {id}});

            if(!question){
                return {
                    code: 404,
                    message:`Question with ID ${id} not found`,
                }
            }

            question.question = updateData.question;

            await this.questionRepo.save(question);

            return {
                code: 200,
                message:"Question updated successfully",
            }
        } catch(error){
            throw new Error(`Failed to update question: ${error.message}`);
        }
    }

    async updateOption(id: number, updateData:{option: string}): Promise<CreateFeedBackResponseDTO> {
        try{
            const option = await this.questionOptionRepo.findOne({where:{id: id}});

            if(!option){
                return {
                    code: 404,
                    message:`option with ID ${id} not found`,
                }
            }

            option.option = updateData.option;

            await this.questionOptionRepo.save(option);

            return {
                code: 200,
                message:"Option updated successfully",
            }
        } catch(error){
            throw new Error(`failed to update option: ${error.message}`);
        }
    }

    async getOpenedQuestions(songId: string): Promise<{
        code: number;
        message: string;
        questions: Question[];
    }> {
        const song = await this.songRepo.findOne({
            where: { id: songId},
            relations: ['questions'],
        })

        if (!song) return { code: 400, message: 'Song not found', questions: [] };
        const openedQuestions = song.questions.filter(q => q.type === QuestionType.OPEN_ENDED);
        if (!openedQuestions.length) return { code: 400, message: 'No opened questions for this song', questions: [] };
        return { code: 200, message: 'Opened questions retrieved successfully', questions: openedQuestions };
    }
}