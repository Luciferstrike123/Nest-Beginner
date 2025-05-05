import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionOption } from 'src/entities/questions.option.entity';
import { Question } from 'src/entities/question.entity';
import { Answer } from 'src/entities/answer.entity';
import { Song } from 'src/entities/song.entity';
import { User } from 'src/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Question,QuestionOption,Answer,Song,User])], // Add your entities here
    controllers: [AnswerController],
    providers: [AnswerService],
})
export class AnswerModule {}