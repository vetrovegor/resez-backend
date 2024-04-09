import { Length } from 'class-validator';

export class AuthDto {
    @Length(3, 20, { message: 'Никнейм должен быть от 3 до 20 символов' })
    nickname: string;

    @Length(8, 32, { message: 'Пароль должен быть от 8 до 32 символов' })
    password: string;
}
