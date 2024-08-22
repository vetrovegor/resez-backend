import { Transform, Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateIf,
    ValidateNested
} from 'class-validator';

export class QaDto {
    id?: number;

    @Transform(({ value }) => value.toString())
    @ValidateIf(o => o.questionText || !o.questionPicture)
    @IsString({ message: 'Текст вопроса должен быть строкой' })
    @MaxLength(2500)
    questionText: string;

    @ValidateIf(o => o.questionPicture || !o.questionText)
    @IsString({ message: 'Картинка вопроса должна быть строкой' })
    questionPicture: any;

    @Transform(({ value }) => value.toString())
    @ValidateIf(o => o.answerText || !o.answerPicture)
    @IsString({ message: 'Текст ответа должен быть строкой' })
    @MaxLength(2500)
    answerText: string;

    @ValidateIf(o => o.answerPicture || !o.answerText)
    @IsString({ message: 'Картинка ответа должна быть строкой' })
    answerPicture: any;
}

export class CollectionDto {
    @IsString({ message: 'Название коллекции должно быть строкой' })
    @IsNotEmpty({ message: 'Название коллекции не должно быть пустым' })
    collection: string;

    @IsOptional()
    @IsString({ message: 'Описание должно быть строкой' })
    description: string;

    @IsBoolean({ message: 'Значение приватности должно быть булевым' })
    @IsNotEmpty({ message: 'Значение приватности не должно быть пустым' })
    isPrivate: boolean;

    @IsArray({ message: 'Значение пар должно быть массивом' })
    @ArrayMinSize(2, { message: 'Должно быть минимум 2 вопроса-ответа' })
    @ArrayMaxSize(500, {
        message: 'Максимальное количество вопросов-ответов - 500'
    })
    @ValidateNested({ each: true, message: 'Каждая пара должна быть валидной' })
    @Type(() => QaDto)
    pairs: QaDto[];
}
