import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Patch,
    UsePipes, ValidationPipe,
    UseGuards,
    Req,
    Query
  } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedBackRequestDTO } from './dto/request/createFeedback.dto.request';
import { CreateFeedBackResponseDTO } from './dto/response/createFeedback.dto.response';
import { DeleteQuestionsDto } from './dto/request/deleteQuestion.dto.request';
import { DeleteOptionsDto } from './dto/request/deleteOption.dto.request';
import { AddNewOptions } from './dto/request/addNewOptions.dto.request';
import { Question } from 'src/entities/question.entity';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { Request } from 'express';


@ApiTags('feedbacks')
@Controller('feedbacks')
export class FeedbackController{
    constructor(private readonly FeedbackService: FeedbackService){}

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({summary: "Create list question to collect users'feedbacks"})
    @ApiBody({
      description: 'Create feedback questions for a specific song',
      type: CreateFeedBackRequestDTO,
      examples: {
        default: {
          summary: 'Example feedback question payload',
          value: {
            id_song: '27b3eb41-4cca-4ab6-ae04-8c7747c6f4cc',
            questions: [
              {
                type: 'SINGLE_CHOICE',
                question: 'What do you think about the melody?',
                options: ['Good', 'Medium', 'Bad'],
              },
              {
                type: 'MULTIPLE_CHOICE',
                question: 'What aspects of the song do you like?',
                options: ['Melody', 'Lyrics', 'Rhythm'],
              },
              {
                type: 'OPEN_ENDED',
                question: 'Please share your detailed feedback about the song.',
              },
              {
                type: 'RATING_SCALE',
                question: 'How would you rate the overall quality of the song?',
                options: ['1', '2', '3', '4', '5'],
              },
              {
                type: 'YES_NO',
                question: 'Would you recommend this song to others?',
                options: ['Yes', 'No'],
              },
            ],
          },
        },
      },
    })
    createFeedbacks(
      @Req() req: Request,
      @Body() createFeedbacksDTO: CreateFeedBackRequestDTO,
    ): Promise<CreateFeedBackResponseDTO> {
      const userId = (req.user as { userId: string }).userId;
      if (!userId) {
        throw new Error('User not found');
      }
      return this.FeedbackService.create(userId ,createFeedbacksDTO);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Get()
    @ApiOperation({summary:"Get list question of the song"})
    @ApiQuery({ name: 'song', required: true, description: 'ID of the song' })
    find(@Query('song') id_song: string){
      return this.FeedbackService.find(id_song);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Delete(':id_song')
    @ApiOperation({summary: "Delete list question of the song"})
    delete(
      @Req() req: Request,
      @Param('id_song') id_song: string){
      const userId = (req.user as { userId: string }).userId;
      if (!userId) {
        throw new Error('User not found');
      }

      return this.FeedbackService.delete(userId , id_song);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Delete('delete-questions/:ids')
    @ApiOperation({summary: 'Delete multiple questions by their IDs (comma-separated)'})
    deleteQuestions(
      @Req() req: Request,
      @Param('ids') ids: string): Promise<CreateFeedBackResponseDTO>{
      const questionIds = ids.split(',').map((id) => parseInt(id,10));
      const dto = new DeleteQuestionsDto();
      dto.questionIds = questionIds;
      const userId = (req.user as { userId: string }).userId;
      if (!userId) {
        throw new Error('User not found');
      }
      return this.FeedbackService.deleteQuestions(userId,dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Delete('delete-options/:ids')
    @ApiOperation({ summary: 'Delete multiple question options by their IDs (comma-separated)' })
    @ApiParam({
      name: 'ids',
      required: true,
      description: 'Comma-separated list of question option IDs to delete (e.g., "1,2,3")',
    })    
    deleteOptions(@Req() req: Request ,@Param('ids') ids: string): Promise<CreateFeedBackResponseDTO> {
      const userId = (req.user as { userId: string }).userId;
      if (!userId) {
        throw new Error('User not found');
      }
      const optionIds = ids.split(',').map((id) => parseInt(id,10));
      const dto = new DeleteOptionsDto();
      dto.optionIds = optionIds;
      return this.FeedbackService.deleteOptions(dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post('add-questions')
    @ApiOperation({ summary: 'Add new questions to a song based on the given song ID and question data' })
    @ApiBody({
      description: 'DTO including song ID and an array of questions with their types and options',
      type: CreateFeedBackRequestDTO,
    })    
    addQuestions(@Body() newQuestions: CreateFeedBackRequestDTO): Promise<CreateFeedBackResponseDTO>{
      return this.FeedbackService.addNewQuestions(newQuestions);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post('add-options')
    @ApiOperation({ summary: 'Add new options to existing questions based on question IDs' })
    @ApiBody({
      description: 'Includes question IDs and the new options to be added for each',
      type: AddNewOptions,
    })    
    addOptions(@Body() newRequests: AddNewOptions): Promise<CreateFeedBackResponseDTO> {
      return this.FeedbackService.addNewOptions(newRequests);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Patch('questions/:id')
    @ApiOperation({ summary: 'Update the content of a specific question by ID' })
    @ApiParam({ name: 'id', description: 'ID of the question to update', type: Number })
    @ApiBody({
      description: 'New content for the question',
      schema: {
        example: { question: 'What is your favorite genre?' },
      },
    })
    updateQuestion(@Param('id') id: number, @Body() updateData:{question:string}):Promise<CreateFeedBackResponseDTO> {
      return this.FeedbackService.updateQuestion(id, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Patch('options/:id')
    @ApiOperation({ summary: 'Update the content of a specific option by ID' })
    @ApiParam({ name: 'id', description: 'ID of the option to update', type: Number })
    @ApiBody({
      description: 'New content for the option',
      schema: {
        example: { option: 'Pop music' },
      },
    })
    updateOption(@Param('id') id:number, @Body() updateData:{option: string}): Promise<CreateFeedBackResponseDTO> {
      return this.FeedbackService.updateOption(id, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Get('openedQuestion')
    @ApiOperation({ summary: 'Get opened questions for a specific song' })
    @ApiQuery({ name: 'songId', required: true, description: 'ID of the song to retrieve opened questions for' })
    getOpenedQuestion(
      @Query('songId') songId: string,
    ): Promise<{
      code: number;
      message: string;
      questions: Question[];
    }> {
      return this.FeedbackService.getOpenedQuestions(songId);
    }
}