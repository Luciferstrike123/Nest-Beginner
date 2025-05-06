import { Expose } from 'class-transformer';
import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { QuestionItemDTO } from '../request/questionItem.dto';

export class CreateFeedBackResponseDTO {
    code: number;
    message: string;
}