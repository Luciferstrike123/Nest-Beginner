import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { Answer } from './answer.entity';
import { Role } from './enums/role.enum';
import { Song } from './song.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  username: string;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => Song, (song) => song.author)
  music: Song[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
  
  @OneToMany(() => Answer, (answer) => answer.user)
  answers: Answer[];

  @Column({default: 0})
  totalScore: number;
}
