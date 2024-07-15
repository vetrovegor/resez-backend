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
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ScoreConversionItemDto)
    scoreConversion: ScoreConversionItemDto[];
}

// сделать проверку что если есть одни параметры то должны быть и другие
export class ScoreConversionItemDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsOptional()
    primaryScore: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsOptional()
    secondaryScore: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsOptional()
    minScore: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsOptional()
    maxScore: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsOptional()
    grade: number;

    @IsBoolean()
    @IsNotEmpty()
    isRed: boolean;

    @IsBoolean()
    @IsNotEmpty()
    isGreen: boolean;
}
