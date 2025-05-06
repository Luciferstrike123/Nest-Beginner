import { ApiProperty } from "@nestjs/swagger";

export class StatisticResponseDto {
    @ApiProperty()
    code: number;
    @ApiProperty()
    message: string;
    data?: {
        songId: string;
        totalParticipants: number;
        questionStatistics: {
            questionId: number;
            question: string;
            questionType: string;
            totalAnswers: number;
            openAnswerCount: number; // Chỉ chứa số lượng
            optionsStatistics: {
                optionId: number;
                optionText: string;
                totalAnswers: number;
            }[];
        }[];
    };   
}

export class OpenedAnswersPaginatedDto {
    @ApiProperty()
    code: number;
    @ApiProperty()
    message: string;
    data?: {
        questionId: number;
        question: string;
        openedAnswers: string[];
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        }
    }
}
