import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { QuestionOption } from './questions.option.entity';

@Entity()
export class Answer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => QuestionOption, (questionOption) => questionOption.answers, {
        onDelete:'CASCADE',
        nullable: true,
    })
    questionOption: QuestionOption;

    @Column({nullable: true})
    questionId: number;

    @ManyToOne(() => User, (user) => user.answers, {
        onDelete:'CASCADE',
    })
    user: User;

    @Column({nullable: true})
    openedAnswer:string;
}