import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Song } from './song.entity';
import { Question } from './question.entity';
import { QuestionOption } from './questions.option.entity';

@Entity()
export class Answer {
    @PrimaryGeneratedColumn()
    id: string;

    @ManyToOne(() => QuestionOption, (questionOption) => questionOption.answers, {
        onDelete:'CASCADE',
    })
    questionOption: QuestionOption;

    @ManyToOne(() => User, (user) => user.answers, {
        onDelete:'CASCADE',
    })
    user: User;
}