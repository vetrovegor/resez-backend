import bcrypt from 'bcrypt';
import { UploadedFile } from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import { Op } from "sequelize";

import User from "../db/models/User";
import { ApiError } from '../ApiError';
import { UserAdminInfo, UserPreview, UserProfileInfo, UserSettingsInfo, UserShortInfo } from 'types/user';
import { STATIC_PATH } from '../consts/STATIC_PATH';
import { FILE_EXTENSIONS } from '../consts/FILE-EXTENSIONS';
import { PaginationDTO } from '../dto/PaginationDTO';
import socketService from './socketService';
import { EmitTypes } from 'types/socket';
import { CollectionSettings } from 'types/collection';
import { calculateLevelInfo, getArraysIntersection } from '../utils';
import UserRole from '../db/models/UserRole';

class UserService {
    async getUserById(id: number): Promise<User> {
        const user = await User.findByPk(id);

        if (!user) {
            throw ApiError.notFound('Пользователь не найден');
        }

        return user;
    }

    async getUserByNickname(nickname: string): Promise<User> {
        return await User.findOne({
            where: {
                nickname
            }
        });
    }

    async getVerifiedUserByTelegramChatId(telegramChatId: string): Promise<User> {
        return await User.findOne({
            where: {
                isVerified: true,
                telegramChatId
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

        return await user.toShortInfo();
    }

    async verifyUser(userId: number, telegramChatId: string): Promise<void> {
        const user = await this.getUserById(userId);

        user.set('isVerified', true);
        user.set('telegramChatId', telegramChatId);

        await user.save();

        socketService.emitByUserId(
            userId,
            EmitTypes.Verify,
            { user: await user.toShortInfo() }
        );
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

    async updateSettings(userId: number, isPrivateAccount: boolean, isHideAvatars: boolean): Promise<UserSettingsInfo> {
        const user = await this.getUserById(userId);

        user.set('isPrivateAccount', isPrivateAccount);
        user.set('isHideAvatars', isHideAvatars);

        await user.save();

        return { isPrivateAccount, isHideAvatars }
    }

    async setAvatar(userId: number, avatar: UploadedFile): Promise<UserShortInfo> {
        const user = await User.findByPk(userId);
        const oldAvatar = user.get('avatar');

        if (oldAvatar) {
            const oldAvatarPath = path.resolve(STATIC_PATH, oldAvatar);
            fs.existsSync(oldAvatarPath) && fs.unlinkSync(oldAvatarPath);
        }

        const extension = FILE_EXTENSIONS[avatar.mimetype] || '.jpg';
        const avatarName = Date.now() + extension;

        avatar.mv(path.resolve(STATIC_PATH, avatarName));

        user.set('avatar', avatarName);
        await user.save();

        return await user.toShortInfo();
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

        return await user.toShortInfo();
    }

    async searchUsers(search: string, limit: number, offset: number): Promise<PaginationDTO<UserPreview>> {
        const whereOptions = { nickname: { [Op.iLike]: `%${search}%` } };

        const users = await User.findAll({
            where: whereOptions,
            order: [['registrationDate', 'DESC']],
            limit,
            offset
        });

        const userDTOs = users.map(user => user.toPreview());

        const totalCount = await User.count({
            where: whereOptions
        });

        return new PaginationDTO<UserPreview>("users", userDTOs, totalCount, limit, offset);
    }

    async validateUserIDs(userIDs: number[]): Promise<number[]> {
        userIDs = [...new Set(userIDs)];

        for (const userId of userIDs) {
            if (isNaN(Number(userId))) {
                throw ApiError.badRequest('id пользователя должен быть числом');
            }

            await this.getUserById(userId);
        }

        return userIDs;
    }

    async getAllUserIDs(): Promise<number[]> {
        const users = await User.findAll();

        return users.map(user => user.get('id'));
    }

    async getUserCollectionSettings(userId: number): Promise<CollectionSettings> {
        const user = await this.getUserById(userId);

        return user.getCollectionSettings();
    }

    async updateCollectionSettings(userId: number, isShuffleCards: boolean, isDefinitionCardFront: boolean): Promise<CollectionSettings> {
        const user = await this.getUserById(userId);

        user.set('isShuffleCards', isShuffleCards);
        user.set('isDefinitionCardFront', isDefinitionCardFront);

        await user.save();

        return { isShuffleCards, isDefinitionCardFront }
    }

    async getUsers(limit: number, offset: number, search?: string, blocked?: string, verified?: string, online?: string, hasRole?: string, roleId?: number): Promise<PaginationDTO<UserAdminInfo>> {
        const whereOptions: {
            nickname?: { [Op.iLike]: string },
            isBlocked?: boolean,
            isVerified?: boolean,
            id?: { [Op.in]: number[] }
        } = {};

        if (search) {
            whereOptions.nickname = { [Op.iLike]: `%${search}%` };
        }

        if (blocked) {
            whereOptions.isBlocked = blocked.toLowerCase() === 'true';
        }

        if (verified) {
            whereOptions.isVerified = verified.toLowerCase() === 'true';
        }

        const userIDsArrays: number[][] = [];

        if (online && online.toLowerCase() === 'true') {
            userIDsArrays.push(socketService.getOnlineUserIDs());
        }

        if (hasRole && hasRole.toLowerCase() === 'true') {
            // вынести в roleService в getAdminIDs?
            const userRoles = await UserRole.findAll();

            userIDsArrays.push(userRoles.map(
                userRole => userRole.get('userId')
            ));
        }

        if (roleId) {
            // вынести в roleService в getAdminIDsbyRoleId?
            const userRoles = await UserRole.findAll({
                where: {
                    roleId
                }
            });

            userIDsArrays.push(userRoles.map(
                userRole => userRole.get('userId')
            ));
        }

        if (userIDsArrays.length) {
            whereOptions.id = {
                [Op.in]: getArraysIntersection(userIDsArrays)
            };
        }

        const users = await User.findAll({
            where: whereOptions,
            order: [['registrationDate', 'DESC']],
            limit,
            offset
        });

        const usersDtos = await Promise.all(
            users.map(async user => await user.toAdminInfo())
        );

        const totalCount = await User.count({
            where: whereOptions
        });

        return new PaginationDTO<UserAdminInfo>("users", usersDtos, totalCount, limit, offset);
    }

    async setUserBlockStatus(adminId: number, userId: number, blockStatus: boolean, reason: string = null): Promise<UserAdminInfo> {
        if (adminId == userId) {
            throw ApiError.badRequest('Нельзя выполнять данное действие на самом себе');
        }

        const user = await this.getUserById(userId);

        user.set('isBlocked', blockStatus);
        user.set('blockReason', reason);
        await user.save();

        socketService.emitByUserId(
            userId,
            blockStatus ? EmitTypes.Blocked : EmitTypes.Unblocked,
            blockStatus ? { reason } : null
        );

        // залогировать бан

        return await user.toAdminInfo();
    }

    async increaseXP(nickname: string, xp: number) {
        const user = await this.getUserByNickname(nickname);

        const { level: oldLevel } = calculateLevelInfo(user.get('xp'));

        if (!user) {
            throw ApiError.notFound('Пользователь не найден');
        }

        await user.increment('xp', { by: xp });

        const levelInfo = calculateLevelInfo(user.get('xp'));

        if (levelInfo.level > oldLevel) {
            socketService.emitByUserId(user.get('id'), EmitTypes.NewLevel, levelInfo);
        }

        return await user.toShortInfo();
    }
}

export default new UserService();