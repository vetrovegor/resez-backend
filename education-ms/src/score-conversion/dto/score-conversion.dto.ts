import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    ValidateNested
} from 'class-validator';

export class ScoreConversionDto {
    @IsArray({ message: 'Таблица баллов должна быть массивом' })
    @ArrayMinSize(1, {
        message: 'Таблица баллов должна содержать хотя бы один элемент'
    })
    @ValidateNested({ each: true })
    @Type(() => ScoreConversionItemDto)
    scoreConversion: ScoreConversionItemDto[];
}

export class ScoreConversionItemDto {
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Первичный балл должен быть числом' })
    @IsOptional()
    primaryScore: number;

    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Вторичный балл должен быть числом' })
    @IsOptional()
    secondaryScore: number;

    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Минимальный балл должен быть числом' })
    @IsOptional()
    minScore: number;

    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Максимальный балл должен быть числом' })
    @IsOptional()
    maxScore: number;

    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Оценка должна быть числом' })
    @IsOptional()
    grade: number;

    @IsBoolean({ message: 'Поле "isRed" должно быть булевым значением' })
    @IsNotEmpty({ message: 'Поле "isRed" не должно быть пустым' })
    isRed: boolean;

    @IsBoolean({ message: 'Поле "isRed" должно быть булевым значением' })
    @IsNotEmpty({ message: 'Поле "isGreen" не должно быть пустым' })
    isGreen: boolean;
}
