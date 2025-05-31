import { Expose, Type } from 'class-transformer';
import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from 'src/entities/enums/question.type.enum';

class QuestionItem {
    @Expose()
    @ApiProperty()
    @IsEnum(QuestionType)
    type: QuestionType;

    @Expose()
    @ApiProperty()
    @IsString()
    question: string;

    @Expose()
    @ApiProperty()
    @IsArray()
    @IsString({each: true})
    @IsOptional()
    options?: string[];
}


export class CreateFeedBackRequestDTO {
    @Expose()
    @ApiProperty()
    id_song: string;

    @Expose()
    @IsArray()
    @Type(() => QuestionItem)
    @ApiProperty({
        type: () => [QuestionItem], // chỉ rõ kiểu mảng
        description: 'List of questions with type and optional options',
    })
    questions: QuestionItem[];
}