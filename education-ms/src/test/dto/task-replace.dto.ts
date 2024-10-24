import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class TaskReplaceDto {
    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    @IsNumber()
    oldTaskId: number;

    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    @IsNumber()
    newTaskId: number;
}
