import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Song } from './song.entity';
import { User } from './user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Song)
  song: Song;
}
