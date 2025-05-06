import { ApiProperty } from "@nestjs/swagger";

export class AnswerResponseDto {
    @ApiProperty()
    code: number;
    @ApiProperty()
    message: string;
}