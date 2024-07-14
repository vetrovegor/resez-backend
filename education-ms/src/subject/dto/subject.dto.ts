import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsString,
    ValidateNested
} from 'class-validator';

export class SubjectDto {
    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    durationMinutes: number;

    @IsBoolean()
    @IsNotEmpty()
    isMark: boolean;

    @IsBoolean()
    @IsNotEmpty()
    isPublished: boolean;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => SubjectTask)
    subjectTasks: SubjectTask[];
}

export class SubjectTask {
    number: number;

    @IsString()
    @IsNotEmpty()
    theme: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    primaryScore: number;

    @IsBoolean()
    @IsNotEmpty()
    isDetailedAnswer: boolean;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => SubThemeDto)
    subThemes: SubThemeDto[];
}

export class SubThemeDto {
    @IsString()
    @IsNotEmpty()
    subTheme: string;
}
