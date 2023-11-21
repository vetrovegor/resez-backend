import bcrypt from 'bcrypt';

import userService from "./userService";
import { ApiError } from "../apiError";
import User from '../db/models/User';
import codeService from './codeService';
import { VerificationCodeData } from 'types/code';

class AuthService {
    async register(nickname: string, password: string): Promise<User> {
        const existedUser = await userService.getUserByNickname(nickname);

        if (existedUser) {
            throw ApiError.badRequest(`Пользователь с таким никнеймом уже существует`);
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const user = await userService.registerUser(nickname, hashPassword);

        return user;
    }

    async login(nickname: string, password: string): Promise<{user: User, verificationCodeData: VerificationCodeData }> {
        const user = await userService.getUserByNickname(nickname);

        if (!user) {
            this.throwInvalidLoginOrPassword();
        }

        const comparePassword = await bcrypt.compare(password, user.get('password'));

        if (!comparePassword) {
            this.throwInvalidLoginOrPassword();
        }

        const { id, isVerified } = user.toJSON();

        if(!isVerified) {
            var verificationCodeData = await codeService.createVerificationCode(id);
        }

        return {
            user,
            verificationCodeData
        };
    }

    throwInvalidLoginOrPassword() {
        throw ApiError.badRequest('Неверное имя пользователя или пароль');
    }
}

export default new AuthService();