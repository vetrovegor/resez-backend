import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MatchDto {
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Id предмета должно быть числом' })
    @IsNotEmpty({ message: 'Id предмета не должно быть пустым' })
    subjectId: number;

    @IsString({ message: 'Текст задания должен быть строкой' })
    @IsNotEmpty({ message: 'Текст задания не должен быть пустым' })
    task: string;

    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Id задания должно быть числом' })
    @IsOptional()
    excludeTaskId: number;
}
