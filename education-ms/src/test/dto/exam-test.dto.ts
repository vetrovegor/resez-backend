import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class ExamTestDto {
    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    @IsNumber()
    subjectId: number;

    @IsNotEmpty()
    @IsBoolean()
    isPrivate: boolean;

    @IsNotEmpty()
    @IsBoolean()
    isOfficial: boolean;
}
