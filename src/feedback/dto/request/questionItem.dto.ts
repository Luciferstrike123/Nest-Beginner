import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { QuestionType } from 'src/entities/enums/question.type.enum';

export class QuestionItemDTO {
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
    options?: {id: number, option: string}[];
}