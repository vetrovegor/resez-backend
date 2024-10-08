import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';

export class TestSubmitDto {
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Затраченное время должно быть числом' })
    @Min(1, { message: 'Затраченное время должно быть положительным' })
    secondsSpent: number;

    @IsOptional()
    @IsArray({
        message: 'Задания без развернутого ответа должны быть массивом'
    })
    @ValidateNested({ each: true })
    @Type(() => SimpleTaskDto)
    simpleTasks: SimpleTaskDto[];

    @IsOptional()
    @IsArray({
        message: 'Задания с развернутым ответом должны быть массивом'
    })
    @ValidateNested({ each: true })
    @Type(() => DetailedTaskDto)
    detailedTasks: DetailedTaskDto[];
}

class SimpleTaskDto {
    @Transform(({ value }) => Number(value))
    @IsNotEmpty({ message: 'Id задания не может быть пустым' })
    @IsNumber({}, { message: 'Id задания должно быть числом' })
    id: number;

    @IsString({ message: 'Ответ должен быть строкой' })
    answer: string;
}

class DetailedTaskDto {
    @Transform(({ value }) => Number(value))
    @IsNotEmpty({ message: 'Id задания не может быть пустым' })
    @IsNumber({}, { message: 'Id задания должно быть числом' })
    id: number;

    @Transform(({ value }) => Number(value))
    @IsNotEmpty({ message: 'Первичный балл не может быть пустым' })
    @IsNumber({}, { message: 'Первичный балл должен быть числом' })
    @Min(0, { message: 'Первичный балл должен быть неотрицательным' })
    primaryScore: number;
}
