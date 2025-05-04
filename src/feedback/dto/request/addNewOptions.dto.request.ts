import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class OptionItem {
    @ApiProperty({ example: 1, description: 'ID of the question' })
    id_question: number;

    @ApiProperty({
        example: ['Option 1', 'Option 2'],
        description: 'List of new options to add',
        type: [String],
    })
    newOptions: string[];
}

export class AddNewOptions {
    @ApiProperty({
        description: 'Array of option additions, each with a question ID and its new options',
        type: [OptionItem],
    })
    @Type(() => OptionItem)
    addOptions: OptionItem[];
}