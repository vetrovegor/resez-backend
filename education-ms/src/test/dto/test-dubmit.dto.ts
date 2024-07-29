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

    @IsNotEmpty({ message: 'Ответ не должеы быть пустыми' })
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
