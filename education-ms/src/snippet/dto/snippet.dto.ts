import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SnippetDto {
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Id предмета предмета должно быть числом' })
    @IsNotEmpty({ message: 'Id предмета предмета не должно быть пустым' })
    subjectId: number;

    @IsString({ message: 'Заголовок вставки должен быть строкой' })
    @IsOptional()
    title: string;

    @IsString({ message: 'Текст вставки должен быть строкой' })
    @IsNotEmpty({ message: 'Текст вставки не должен быть пустым' })
    content: string;
}
