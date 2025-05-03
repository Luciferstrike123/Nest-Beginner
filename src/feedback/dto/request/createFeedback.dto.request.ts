import { Expose } from 'class-transformer';
import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { QuestionItemDTO } from './questionItem.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedBackRequestDTO {
    @Expose()
    @ApiProperty()
    id_song: string;

    @Expose()
    @IsArray()
    @ApiProperty()
    questions: QuestionItemDTO[];
}