import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class ImageDto {
    @ApiProperty()
    @IsUrl({}, { message: 'Поле "url" должно быть ссылкой' })
    @IsNotEmpty()
    url: string;
}
