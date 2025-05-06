import { Expose } from "class-transformer";
import { IsArray } from "class-validator";
import { QuestionItemDTO } from "../request/questionItem.dto";

export class GetFeedbackResponseDTO {
    code: number;
    message: string;
    id_song: string;

    @Expose()
    @IsArray()
    questions: QuestionItemDTO[];
}