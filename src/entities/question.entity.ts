import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import {Song} from './song.entity';
import { QuestionType } from './enums/question.type.enum';
import { QuestionOption } from './questions.option.entity';

@Entity()
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    question: string;

    @Column({
        type:'enum',
        enum: QuestionType,
        default: QuestionType.SINGLE_CHOICE,
    })
    type: QuestionType;

    @ManyToOne(() => Song, (song) => song.questions, {
        onDelete: 'CASCADE',
    })
    song: Song;

    @OneToMany(() => QuestionOption, (questionOption)=> questionOption.question, {cascade: true})
    questionOptions: QuestionOption[];
}