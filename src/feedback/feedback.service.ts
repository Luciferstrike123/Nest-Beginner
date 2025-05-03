import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Question)
        private questionRepo: Repository<Question>,

        @InjectRepository(QuestionOption)
        private questionOptionRepo: Repository<QuestionOption>,

        @InjectRepository(Song)
        private songRepo: Repository<Song>,
    ) {}
    
    async create(feedbackDto: CreateFeedBackRequestDTO): Promise<CreateFeedBackResponseDTO> {
        const id_song = feedbackDto.id_song;
        const song = await this.songRepo.findOne({where: {id: id_song}});
        if (!song) {
            throw new NotFoundException(`Song with ID ${id_song} not found`);
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

            const questionItems: QuestionItemDTO[] = song.questions.map((question) => ({
                id: question.id,
                question: question.question,
                type: question.type,
                options: question.questionOptions?.map((option) => option.option) || [],
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

    async delete(id_song: string): Promise<CreateFeedBackResponseDTO> {
        const song = await this.songRepo.findOne({where: {id: id_song}});
        if (!song) {
            throw new NotFoundException(`Song with ID ${id_song} not found`);
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

    async deleteQuestions(questions: DeleteQuestionsDto): Promise<CreateFeedBackResponseDTO> {
        const {questionIds} = questions;

        if(questionIds.length <= 0){
            throw new NotFoundException("The questionIds is empty");
        } else{
            await this.questionRepo.delete(questionIds);
        }

        return{
            code: 200,
            message: "The feedback questions deleted successfully",
        }
    }

    async deleteOptions(options: DeleteOptionsDto): Promise<CreateFeedBackResponseDTO> {
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
            code: 200,
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
            code: 200,
            message: "Add new options successfully",
        }
    }

}