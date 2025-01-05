import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SourceRequestDto {
    @ApiProperty({
        example: 'Решу ЕГЭ'
    })
    @IsString({ message: 'Название источника должно быть строкой' })
    @IsNotEmpty({ message: 'Название источника не должно быть пустым' })
    source: string;

    @ApiProperty({
        example: 'reshu-ege'
    })
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message:
            'Ярлык должен содержать только латинские буквы в нижнем регистре, цифры и дефисы'
    })
    @IsNotEmpty({ message: 'Поле ярлык не должно быть пустым' })
    slug: string;
}
