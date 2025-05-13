import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
import { QuestionOption } from 'src/entities/questions.option.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Song } from 'src/entities/song.entity';
import { User } from 'src/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Question, QuestionOption, Song, User])],
    providers: [FeedbackService],
    controllers: [FeedbackController],
})
export class FeedbackModule {}