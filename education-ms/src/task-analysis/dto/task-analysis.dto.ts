import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TaskAnalysisDto {
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Id темы должно быть числом' })
    @IsNotEmpty({ message: 'Id темы не должно быть пустым' })
    subjectTaskId: number;

    @IsString({ message: 'Текст разбора задания должен быть строкой' })
    @IsNotEmpty({ message: 'Текст разбора задания не должен быть пустым' })
    content: string;
}
