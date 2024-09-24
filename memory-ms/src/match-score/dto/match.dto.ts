import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class MatchDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    collectionId: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    time: number;
}
