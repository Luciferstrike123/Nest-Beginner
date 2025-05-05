
export class StatisticResponseDto {
    code: number;
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
    code: number;
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
