import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

import User from "../db/models/User";
import { ApiError } from '../apiError';
import { UserProfileInfo, UserShortInfo } from 'types/user';
import { STATIC_PATH } from '../consts/STATIC_PATH';
import { FILE_EXTENSIONS } from '../consts/FILE-EXTENSIONS';

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

    async getUserShortInfo(userId: number): Promise<UserShortInfo> {
        const user = await this.getUserById(userId);

        return user.toShortInfo();
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

    async getUserBlockStatusById(userId: number): Promise<boolean> {
        const user = await this.getUserById(userId);

        return user.get('isBlocked');
    }

    async getProfileInfo(userId: number): Promise<UserProfileInfo> {
        const user = await this.getUserById(userId);

        return user.toProfileInfo();
    }

    async updateProfile(userId: number, firstName: string, lastName: string, birthDate: Date, gender: string): Promise<UserProfileInfo> {
        const user = await this.getUserById(userId);

        user.set('firstName', firstName);
        user.set('lastName', lastName);
        user.set('birthDate', birthDate);
        user.set('gender', gender);

        await user.save();

        return user.toProfileInfo();
    }

    // типизировать avatar
    async setAvatar(userId: number, avatar): Promise<UserShortInfo> {
        const user = await User.findByPk(userId);
        const { avatar: oldAvatarName } = user;

        if (oldAvatarName) {
            const oldAvatarPath = path.resolve(STATIC_PATH, oldAvatarName);
            fs.existsSync(oldAvatarPath) && fs.unlinkSync(oldAvatarPath);
        }

        const avatarExtension = FILE_EXTENSIONS[avatar.mimetype] || '.jpg';
        const avatarName = Date.now() + avatarExtension;

        avatar.mv(path.resolve(STATIC_PATH, avatarName));

        user.set('avatar', avatarName);
        await user.save();

        return user.toShortInfo();
    }

    async deleteAvatar(userId: number): Promise<UserShortInfo> {
        const user = await User.findByPk(userId);
        const avatar = user.get('avatar');

        if (avatar) {
            const avatarPath = path.resolve(STATIC_PATH, avatar);
            fs.existsSync(avatarPath) && fs.unlinkSync(avatarPath);
        }

        user.set('avatar', null);
        await user.save();

        return user.toShortInfo();
    }
}

export default new UserService();