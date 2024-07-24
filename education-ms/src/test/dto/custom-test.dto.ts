import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    ValidateNested
} from 'class-validator';
import { ExamTestDto } from './exam-test.dto';

export class CustomTestDto extends ExamTestDto {
    @IsArray({ message: 'Задания предмета должны быть массивом' })
    @ArrayMinSize(1, {
        message: 'Должно быть хотя бы одно задание в предмете'
    })
    @ValidateNested({ each: true })
    @Type(() => SubjectTaskDto)
    subjectTasks: SubjectTaskDto[];
}

class SubjectTaskDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    count: number;

    @IsArray({ message: 'Id подтем должны быть массивом' })
    @ArrayMinSize(1, {
        message: 'Должен быть хотя бы один id подтемы'
    })
    @IsInt({ each: true })
    subThemeIds: number[];
}
