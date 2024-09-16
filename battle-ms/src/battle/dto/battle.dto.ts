import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class BattleDto {
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Количество участников должно быть числом' })
    @IsNotEmpty({
        message: 'Количество участников не должно быть пустым'
    })
    @Min(2, { message: 'Количество участников должно быть минимум 2' })
    @Max(4, { message: 'Количество участников должно быть максимум 4' })
    playersCount: number;

    @IsBoolean({ message: 'Поле isPrivate должно быть булевым значением' })
    @IsNotEmpty({ message: 'Поле isPrivate не должно быть пустым' })
    isPrivate: boolean;
}
