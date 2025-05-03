import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Author } from './author.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import {Question} from './question.entity';

@Entity()
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ default: 0 })
  playCount: number;

  @ManyToOne(() => Author, (author) => author.music)
  author: Author;

  @OneToMany(() => Comment, (comment) => comment.song)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.song)
  likes: Like[];

  @OneToMany(() => Question, (question) => question.song, {cascade: true})
  questions: Question[];
}
