import { ApiProperty } from '@nestjs/swagger';
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

export class SubThemeDto {
    @ApiProperty()
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Идентификатор подтемы должен быть числом' })
    @IsOptional()
    id: number;

    @ApiProperty()
    @IsString({ message: 'Подтема должна быть строкой' })
    @IsNotEmpty({ message: 'Подтема не должна быть пустой' })
    subTheme: string;
}

export class SubjectTaskDto {
    @ApiProperty()
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Идентификатор задания должен быть числом' })
    @IsOptional()
    id: number;

    @ApiProperty()
    @IsNumber({}, { message: 'Номер задания должен быть числом' })
    @IsOptional()
    number: number;

    @ApiProperty()
    @IsString({ message: 'Тема задания должна быть строкой' })
    @IsNotEmpty({ message: 'Тема не должна быть пустым' })
    theme: string;

    @ApiProperty()
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Первичный балл должен быть числом' })
    @Min(1, { message: 'Основной балл должен быть больше 0' })
    @IsNotEmpty({ message: 'Первичный балл не должен быть пустым' })
    primaryScore: number;

    @ApiProperty()
    @IsBoolean({
        message: 'Поле "Развернутый ответ" должно быть булевым значением'
    })
    @IsNotEmpty({ message: 'Поле "Развернутый ответ" не должно быть пустым' })
    isDetailedAnswer: boolean;

    @ApiProperty({ type: [SubThemeDto] })
    @IsArray({ message: 'Подтемы должны быть массивом' })
    @ArrayMinSize(1, {
        message: 'Должна быть хотя бы одна подтема'
    })
    @ValidateNested({ each: true })
    @Type(() => SubThemeDto)
    subThemes: SubThemeDto[];
}

export class SubjectDto {
    @ApiProperty({
        description: 'Название предмета'
    })
    @IsString({ message: 'Предмет должен быть строкой' })
    @IsNotEmpty({ message: 'Поле предмет не должен быть пустым' })
    subject: string;

    @ApiProperty()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message:
            'Ярлык должен содержать только латинские буквы в нижнем регистре, цифры и дефисы'
    })
    @IsNotEmpty({ message: 'Поле ярлык не должно быть пустым' })
    slug: string;

    @ApiProperty()
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Продолжительность в минутах должна быть числом' })
    @IsNotEmpty({
        message: 'Продолжительность в минутах не должна быть пустым'
    })
    durationMinutes: number;

    @ApiProperty()
    @IsBoolean({ message: 'Поле "Оценка" должно быть булевым значением' })
    @IsNotEmpty({ message: 'Поле "Оценка" не должно быть пустым' })
    isMark: boolean;

    @ApiProperty()
    @IsBoolean({ message: 'Поле "Опубликован" должно быть булевым значением' })
    @IsNotEmpty({ message: 'Поле "Опубликован" не должно быть пустым' })
    isPublished: boolean;

    @ApiProperty({ required: false })
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Позиция должна быть числом' })
    @IsOptional()
    order: number;

    @ApiProperty({ type: [SubjectTaskDto] })
    @IsArray({ message: 'Задания предмета должны быть массивом' })
    @ArrayMinSize(1, {
        message: 'Должно быть хотя бы одно задание в предмете'
    })
    @ValidateNested({ each: true })
    @Type(() => SubjectTaskDto)
    subjectTasks: SubjectTaskDto[];
}
