import { BattleTypes } from '@battle/enums';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    Max,
    Min,
    ValidateIf
} from 'class-validator';

export class BattleDto {
    @IsEnum(BattleTypes)
    @IsNotEmpty()
    type: BattleTypes;

    @ValidateIf(o => o.type === BattleTypes.Collection)
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    collectionId: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    tasksCount: number;

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
