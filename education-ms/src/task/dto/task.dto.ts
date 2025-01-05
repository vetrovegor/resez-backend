import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';

export class TaskDto {
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Id предмета должно быть числом' })
    @IsNotEmpty({ message: 'Id предмета не должно быть пустым' })
    subjectId: number;

    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Id задания предмета должно быть числом' })
    @IsNotEmpty({ message: 'Id задания предмета не должно быть пустым' })
    subjectTaskId: number;

    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Id подтемы должно быть числом' })
    @IsNotEmpty({ message: 'Id подтемы не должно быть пустым' })
    subThemeId: number;

    @IsString({ message: 'Текст задания должен быть строкой' })
    @IsNotEmpty({ message: 'Текст задания не должен быть пустым' })
    task: string;

    @IsString({ message: 'Решение должно быть строкой' })
    @IsOptional()
    solution: string;

    @IsNotEmpty({ message: 'Ответ не должен быть пустым' })
    @IsString({ each: true, message: 'Ответы должны быть массивом' })
    answers: string[];

    @IsBoolean({ message: 'Верификация должна быть булевым значением' })
    @IsNotEmpty({ message: 'Верификация не должна быть пустым' })
    isVerified: boolean;

    @IsString({ message: 'Источник должен быть строкой' })
    @IsOptional()
    source: string;

    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Id источника должно быть числом' })
    @IsOptional()
    sourceId: number;
}
