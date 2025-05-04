import { Expose, Type } from 'class-transformer';
import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { QuestionItemDTO } from './questionItem.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedBackRequestDTO {
    @Expose()
    @ApiProperty()
    id_song: string;

    @Expose()
    @IsArray()
    @Type(() => QuestionItemDTO)
    @ApiProperty({
        type: () => [QuestionItemDTO], // chỉ rõ kiểu mảng
        description: 'List of questions with type and optional options',
    })
    questions: QuestionItemDTO[];
}