import { IsNotEmpty, IsUrl } from 'class-validator';

export class ImageDto {
    @IsUrl({}, { message: 'Поле "url" должно быть ссылкой' })
    @IsNotEmpty()
    url: string;
}
