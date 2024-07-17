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
    @IsNumber()
    @IsNotEmpty()
    subjectId: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    subjectTaskId: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    subThemeId: number;

    @IsString()
    @IsNotEmpty()
    task: string;

    @IsString()
    @IsOptional()
    solution: string;

    @IsString()
    @IsOptional()
    answer: string;

    @IsBoolean()
    @IsNotEmpty()
    isVerified: boolean;
}
