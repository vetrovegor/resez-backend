import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CommentRequestDto {
    @ApiProperty({
        example: 1
    })
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Id задания должно быть числом' })
    @IsNotEmpty({ message: 'Id задания не должно быть пустым' })
    taskId: number;

    @ApiProperty({
        example: 1,
        required: false
    })
    @Transform(({ value }) => Number(value))
    @IsNumber(
        {},
        { message: 'Id родительского комментария должно быть числом' }
    )
    @IsNotEmpty({
        message: 'Id родительского комментария не должно быть пустым'
    })
    @IsOptional()
    parentCommentId: number;

    @ApiProperty({
        example: 'Comment on the task'
    })
    @IsString({ message: 'Текст комментария должен быть строкой' })
    @IsNotEmpty({ message: 'Текст комментария не должен быть пустым' })
    content: string;
}
