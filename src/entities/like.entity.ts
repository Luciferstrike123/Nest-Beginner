import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Song } from "./song.entity";

@Entity()
export class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @ManyToOne(() => User, (user)=>user.comment)
    user: User;

    @ManyToOne(() => Song, (song)=>song.comment)
    song: Song;
}