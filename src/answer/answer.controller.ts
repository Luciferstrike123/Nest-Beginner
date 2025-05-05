import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateAnswerRequestDto } from './dto/request/create.answer.request.dto';
import { AnswerResponseDto } from './dto/response/answerResponse';
import { AnswerService } from './answer.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OpenedAnswersPaginatedDto, StatisticResponseDto } from './dto/response/statisticResponse';

@Controller('answers')
export class AnswerController {
    constructor(private readonly answerService: AnswerService) {}
    
    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ summary: 'Submit answers for a song by a user' })
    createAnswer(
        @Body() createAnswerRequest: CreateAnswerRequestDto,
    ): Promise<AnswerResponseDto> {
        return this.answerService.createAnswer(createAnswerRequest);
    }

    @Get('statistic/:songId')
    getStatistic(@Param('songId') songId: string): Promise<StatisticResponseDto> {
        return this.answerService.getStatistic(songId);
    }

    @Get('opened-answers/:questionId')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ summary: 'Retrieve paginated open-ended answers for a specific question' })
    @ApiQuery({ name: 'page', required: true, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: true, type: Number, example: 20 })
    async getOpenedAnswers(
        @Param('questionId') questionId: number,
        @Query('page') page: number,
        @Query('limit') limit: number,
    ): Promise<OpenedAnswersPaginatedDto> {
        return this.answerService.getOpenedAnswersPaginated(questionId, page, limit);
    }
}