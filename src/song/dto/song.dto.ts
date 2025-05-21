import { Comment } from "src/entities/comment.entity";
import { Like } from "src/entities/like.entity";


export class SongDTO {
    id: string;
    title: string;
    fileUrl: string;
    duration: number;
    playCount: number;
    authorName: string;
    authorId: string;
    comments: Comment[];
    likes: Like[];
}