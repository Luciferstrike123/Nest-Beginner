import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UsePipes, ValidationPipe
  } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedBackRequestDTO } from './dto/request/createFeedback.dto.request';
import { CreateFeedBackResponseDTO } from './dto/response/createFeedback.dto.response';
import { DeleteQuestionsDto } from './dto/request/deleteQuestion.dto.request';
import { DeleteOptionsDto } from './dto/request/deleteOption.dto.request';
import { AddNewOptions } from './dto/request/addNewOptions.dto.request';


@ApiTags('feedbacks')
@Controller('feedbacks')
export class FeedbackController{
    constructor(private readonly FeedbackService: FeedbackService){}

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({summary: "Create list question to collect users'feedbacks"})
    createFeedbacks(
      @Body() createFeedbacksDTO: CreateFeedBackRequestDTO,
    ): Promise<CreateFeedBackResponseDTO> {
      return this.FeedbackService.create(createFeedbacksDTO);
    }

    @Get(':id_song')
    @ApiOperation({summary:"Get list question of the song"})
    find(@Param('id_song') id_song: string){
      return this.FeedbackService.find(id_song);
    }

    @Delete(':id_song')
    @ApiOperation({summary: "Delete list question of the song"})
    delete(@Param('id_song') id_song: string){
      return this.FeedbackService.delete(id_song);
    }

    @Put('delete-questions')
    deleteQuestions(@Body() questions: DeleteQuestionsDto): Promise<CreateFeedBackResponseDTO>{
      return this.FeedbackService.deleteQuestions(questions);
    }

    @Put('delete-options')
    deleteOptions(@Body() options: DeleteOptionsDto): Promise<CreateFeedBackResponseDTO> {
      return this.FeedbackService.deleteOptions(options);
    }

    @Put('add-questions')
    addQuestions(@Body() newQuestions: CreateFeedBackRequestDTO): Promise<CreateFeedBackResponseDTO>{
      return this.FeedbackService.addNewQuestions(newQuestions);
    }

    @Put('add-options')
    addOptions(@Body() newRequests: AddNewOptions): Promise<CreateFeedBackResponseDTO> {
      return this.FeedbackService.addNewOptions(newRequests);
    }

}