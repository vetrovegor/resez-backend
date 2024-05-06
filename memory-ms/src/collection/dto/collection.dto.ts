import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateIf,
    ValidateNested
} from 'class-validator';

export class QaDto {
    @ValidateIf(o => o.questionText || !o.questionPicture)
    @IsString({ message: 'Текст вопроса должен быть строкой' })
    questionText: string;

    @ValidateIf(o => o.questionPicture || !o.questionText)
    @IsString({ message: 'Картинка вопроса должна быть строкой' })
    questionPicture: any;

    @ValidateIf(o => o.answerText || !o.answerPicture)
    @IsString({ message: 'Текст ответа должен быть строкой' })
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
    @ArrayMaxSize(100, {
        message: 'Максимальное количество вопросов-ответов - 100'
    })
    @ValidateNested({ each: true, message: 'Каждая пара должна быть валидной' })
    @Type(() => QaDto)
    pairs: QaDto[];
}