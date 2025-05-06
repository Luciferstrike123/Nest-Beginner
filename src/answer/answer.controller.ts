import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateAnswerRequestDto } from './dto/request/create.answer.request.dto';
import { AnswerResponseDto } from './dto/response/answerResponse';
import { AnswerService } from './answer.service';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OpenedAnswersPaginatedDto, StatisticResponseDto } from './dto/response/statisticResponse';

@ApiTags('Answers')
@Controller('answers')
export class AnswerController {
    constructor(private readonly answerService: AnswerService) {}
    
    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ summary: 'Submit answers for a song by a user' })
    @ApiBody({
        description: 'Submit user answers for a specific song, including both option and open answers.',
        type: CreateAnswerRequestDto,
        examples: {
            default: {
                summary: 'Example payload',
                value: {
                    userId: 'a994fc03-cecd-4273-b31f-481973c85343',
                    songId: '27b3eb41-4cca-4ab6-ae04-8c7747c6f4cc',
                    answers: [
                        {
                            questionId: 1,
                            questionOptionId: 1
                        },
                        {
                            questionId: 2,
                            questionOptionId: [4, 5, 6]
                        },
                        {
                            questionId: 3,
                            openedAnswer: 'I like this song'
                        },
                        {
                            questionId: 4,
                            questionOptionId: 10
                        },
                        {
                            questionId: 5,
                            questionOptionId: 12
                        }
                    ]
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Answers saved successfully',
        type: AnswerResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request - various validation or existence failures',
        type: AnswerResponseDto,
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - User already answered this song',
        type: AnswerResponseDto,
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error - DB save failure',
        type: AnswerResponseDto,
    })
    createAnswer(
        @Body() createAnswerRequest: CreateAnswerRequestDto,
    ): Promise<AnswerResponseDto> {
        return this.answerService.createAnswer(createAnswerRequest);
    }

    @ApiOperation({ summary: 'Get statistics for a specific song' })
    @ApiParam({
        name: 'songId',
        description: 'The ID of the song to retrieve statistics for',
        example: '27b3eb41-4cca-4ab6-ae04-8c7747c6f4cc',
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved song statistics',
        type: StatisticResponseDto,
        examples: {
            default: {
            summary: 'Example of successful song statistics response',
            value: {
                code: 200,
                message: 'Statistics retrieved successfully',
                data: {
                songId: '27b3eb41-4cca-4ab6-ae04-8c7747c6f4cc',
                totalParticipants: 1,
                questionStatistics: [
                    {
                        questionId: 1,
                        question: 'What do you think about the rhythm?',
                        questionType: 'SINGLE_CHOICE',
                        totalAnswers: 1,
                        openAnswerCount: 0,
                        optionsStatistics: [
                            {
                            optionId: 1,
                            optionText: 'Excellent',
                            totalAnswers: 1,
                            },
                            {
                            optionId: 2,
                            optionText: 'Medium',
                            totalAnswers: 0,
                            },
                            {
                            optionId: 3,
                            optionText: 'Bad',
                            totalAnswers: 0,
                            },
                        ],
                    },
                    {
                        questionId: 2,
                        question: 'What aspects of the song do you like?',
                        questionType: 'MULTIPLE_CHOICE',
                        totalAnswers: 3,
                        openAnswerCount: 0,
                        optionsStatistics: [
                            {
                            optionId: 4,
                            optionText: 'Melody',
                            totalAnswers: 1,
                            },
                            {
                            optionId: 5,
                            optionText: 'Lyrics',
                            totalAnswers: 1,
                            },
                            {
                            optionId: 6,
                            optionText: 'Rhythm',
                            totalAnswers: 1,
                            },
                        ],
                    },
                    {
                        questionId: 3,
                        question: 'Please share your detailed feedback about the song.',
                        questionType: 'OPEN_ENDED',
                        totalAnswers: 1,
                        openAnswerCount: 1,
                        optionsStatistics: [],
                    },
                    {
                        questionId: 4,
                        question: 'How would you rate the overall quality of the song?',
                        questionType: 'RATING_SCALE',
                        totalAnswers: 1,
                        openAnswerCount: 0,
                        optionsStatistics: [
                            {
                                optionId: 7,
                                optionText: '1',
                                totalAnswers: 0,
                            },
                            {
                                optionId: 8,
                                optionText: '2',
                                totalAnswers: 0,
                            },
                            {
                                optionId: 9,
                                optionText: '3',
                                totalAnswers: 0,
                            },
                            {
                                optionId: 10,
                                optionText: '4',
                                totalAnswers: 1,
                            },
                            {
                                optionId: 11,
                                optionText: '5',
                                totalAnswers: 0,
                            },
                        ],
                    },
                    {
                        questionId: 5,
                        question: 'Would you recommend this song to others?',
                        questionType: 'YES_NO',
                        totalAnswers: 1,
                        openAnswerCount: 0,
                        optionsStatistics: [
                            {
                                optionId: 12,
                                optionText: 'Yes',
                                totalAnswers: 1,
                            },
                            {
                                optionId: 13,
                                optionText: 'No',
                                totalAnswers: 0,
                            },
                        ],
                    },
                ],
                },
            },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Song not found',
        type: StatisticResponseDto,
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error',
        type: StatisticResponseDto,
    })
    @Get('statistic/:songId')
    getStatistic(@Param('songId') songId: string): Promise<StatisticResponseDto> {
        return this.answerService.getStatistic(songId);
    }

    @Get('opened-answers/:questionId')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ summary: 'Retrieve paginated open-ended answers for a specific question' })
    @ApiQuery({ name: 'page', required: true, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: true, type: Number, example: 10 })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved paginated open-ended answers',
        type: OpenedAnswersPaginatedDto,
        examples: {
          default: {
            summary: 'Example of paginated open-ended answers response',
            value: {
              code: 200,
              message: 'Opened answers retrieved successfully',
              data: {
                questionId: 3,
                question: 'Please share your detailed feedback about the song.',
                openedAnswers: [
                  'I like this song',
                ],
                pagination: {
                  page: 1,
                  limit: 10,
                  totalItems: 1,
                  totalPages: 1,
                },
              },
            },
          },
        },
      })
      @ApiResponse({
        status: 400,
        description: 'Invalid question ID or pagination parameters',
        type: OpenedAnswersPaginatedDto,
      })
      @ApiResponse({
        status: 500,
        description: 'Internal server error',
        type: OpenedAnswersPaginatedDto,
      })
    async getOpenedAnswers(
        @Param('questionId') questionId: number,
        @Query('page') page: number,
        @Query('limit') limit: number,
    ): Promise<OpenedAnswersPaginatedDto> {
        return this.answerService.getOpenedAnswersPaginated(questionId, page, limit);
    }
}