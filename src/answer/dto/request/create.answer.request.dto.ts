
export class Answer {
    questionId: number;
    questionOptionId: number | number[] = -1;  
    openedAnswer: string = "";
}

export class CreateAnswerRequestDto {
    userId: string;
    songId: string;
    answers: Answer[];
}