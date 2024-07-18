import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    Min,
    ValidateNested
} from 'class-validator';

export class SubjectDto {
    @IsString({ message: 'Предмет должен быть строкой' })
    @IsNotEmpty({ message: 'Поле предмет не должен быть пустым' })
    subject: string;

    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message:
            'Ярлык должен содержать только латинские буквы в нижнем регистре, цифры и дефисы'
    })
    @IsNotEmpty({ message: 'Поле ярлык не должно быть пустым' })
    slug: string;

    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Продолжительность в минутах должна быть числом' })
    @IsNotEmpty({
        message: 'Продолжительность в минутах не должна быть пустым'
    })
    durationMinutes: number;

    @IsBoolean({ message: 'Поле "Оценка" должно быть булевым значением' })
    @IsNotEmpty({ message: 'Поле "Оценка" не должно быть пустым' })
    isMark: boolean;

    @IsBoolean({ message: 'Поле "Опубликован" должно быть булевым значением' })
    @IsNotEmpty({ message: 'Поле "Опубликован" не должно быть пустым' })
    isPublished: boolean;

    @IsArray({ message: 'Задания предмета должны быть массивом' })
    @ArrayMinSize(1, {
        message: 'Должно быть хотя бы одно задание в предмете'
    })
    @ValidateNested({ each: true })
    @Type(() => SubjectTaskDto)
    subjectTasks: SubjectTaskDto[];
}

export class SubjectTaskDto {
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Идентификатор задания должен быть числом' })
    @IsOptional()
    id: number;

    @IsNumber({}, { message: 'Номер задания должен быть числом' })
    @IsOptional()
    number: number;

    @IsString({ message: 'Тема задания должна быть строкой' })
    @IsNotEmpty({ message: 'Тема не должна быть пустым' })
    theme: string;

    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Первичный балл должен быть числом' })
    @Min(1, { message: 'Основной балл должен быть больше 0' })
    @IsNotEmpty({ message: 'Первичный балл не должен быть пустым' })
    primaryScore: number;

    @IsBoolean({
        message: 'Поле "Развернутый ответ" должно быть булевым значением'
    })
    @IsNotEmpty({ message: 'Поле "Развернутый ответ" не должно быть пустым' })
    isDetailedAnswer: boolean;

    @IsArray({ message: 'Подтемы должны быть массивом' })
    @ArrayMinSize(1, {
        message: 'Должна быть хотя бы одна подтема'
    })
    @ValidateNested({ each: true })
    @Type(() => SubThemeDto)
    subThemes: SubThemeDto[];
}

export class SubThemeDto {
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Идентификатор подтемы должен быть числом' })
    @IsOptional()
    id: number;

    @IsString({ message: 'Подтема должна быть строкой' })
    @IsNotEmpty({ message: 'Подтема не должна быть пустой' })
    subTheme: string;
}
