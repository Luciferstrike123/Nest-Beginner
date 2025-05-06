import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Question } from './question.entity';
import { Answer } from './answer.entity';


@Entity()
export class QuestionOption {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    option: string;

    @ManyToOne(() => Question, (question) => question.questionOptions,{
        onDelete:'CASCADE',
    })
    question: Question;

    @OneToMany(() => Answer, (answer) => answer.questionOption, {cascade: true})
    answers: Answer[];
}