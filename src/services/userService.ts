import bcrypt from 'bcrypt';

import User from "../db/models/User";
import { ApiError } from '../apiError';

class UserService {
    async getUserById(id: number): Promise<User> {
        return await User.findByPk(id);
    }

    async getUserByNickname(nickname: string): Promise<User> {
        return await User.findOne({
            where: {
                nickname
            }
        });
    }

    async getUserTelegramChatId(userId: number): Promise<string> {
        const user = await this.getUserById(userId);

        return user.get('telegramChatId');
    }

    async registerUser(nickname: string, password: string): Promise<User> {
        return await User.create({
            nickname,
            password,
            registrationDate: Date.now()
        });
    }

    async verifyUser(userId: number, telegramChatId: string): Promise<User> {
        const user = await this.getUserById(userId);

        user.set('isVerified', true);
        user.set('telegramChatId', telegramChatId);

        return await user.save();
    }

    async validateUserPassword(userId: number, oldPassword: string): Promise<void> {
        const user = await this.getUserById(userId);
        const isValid = await bcrypt.compare(oldPassword, user.get('password'));

        if (!isValid) {
            throw ApiError.badRequest('Неверный старый пароль');
        }
    }

    async recoveryPassword(nickname: string, password: string): Promise<User> {
        const user = await this.getUserByNickname(nickname);

        return await this.updatePassword(user.id, password);
    }

    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<User> {
        await this.validateUserPassword(userId, oldPassword);

        return this.updatePassword(userId, newPassword);
    }

    async updatePassword(userId: number, password: string): Promise<User> {
        const user = await this.getUserById(userId);
        const hashPassword = await bcrypt.hash(password, 3);
        user.set('password', hashPassword);

        return await user.save();
    }
}

export default new UserService();