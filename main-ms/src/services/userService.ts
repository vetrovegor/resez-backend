import bcrypt from 'bcrypt';
import { UploadedFile } from 'express-fileupload';
import { Op } from 'sequelize';

import User from '@db/models/User';
import { ApiError } from '@ApiError';
import {
    UserAdminInfo,
    UserPreview,
    UserProfileInfo,
    UserSettingsInfo,
    UserShortInfo
} from 'src/types/user';
import { PaginationDTO } from '../dto/PaginationDTO';
import { EmitTypes } from '@enums/socket';
import { calculateLevelInfo, getArraysIntersection } from '@utils';
import UserRole from '@db/models/UserRole';
import fileService from './fileService';
import rmqService from './rmqService';
import { redisClient } from '../redisClient';
import avatarDecorationService from './store/avatarDecorationService';
import themeService from './store/themeService';
import achievementService from './achievementService';
import { AchievementTypes } from '@enums/achievement';
import { Queues } from '@enums/rmq';
import { Subscriptions } from '@enums/subscriptions';
import logger from '../logger';

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
                nickname: {
                    [Op.iLike]: nickname
                }
            }
        });
    }

    async getVerifiedUserByTelegramChatId(
        telegramChatId: string
    ): Promise<User> {
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
        const user = await User.create({
            nickname,
            password,
            registrationDate: Date.now()
        });

        rmqService.sendToQueue(Queues.Memory, 'create', user.get('id'));

        return user;
    }

    // тестовое кеширование
    async getUserShortInfo(userId: number): Promise<UserShortInfo> {
        // const cachedUser = await redisClient.get(
        //     JSON.stringify({ req: 'short_info', userId })
        // );

        // if (cachedUser) {
        //     return JSON.parse(cachedUser);
        // }

        const user = await this.getUserById(userId);
        const shortInfo = await user.toShortInfo();

        // await redisClient.set(
        //     JSON.stringify({ req: 'short_info', userId }),
        //     JSON.stringify(shortInfo),
        //     { EX: 5 }
        // );

        return shortInfo;
    }

    async getUserPermissions(userId: number) {
        const user = await this.getUserById(userId);
        return user.getPermissions();
    }

    async verifyUser(
        userId: number,
        telegramChatId: string,
        telegramUsername: string
    ): Promise<void> {
        const user = await this.getUserById(userId);

        user.set('isVerified', true);
        user.set('telegramChatId', telegramChatId);
        user.set('telegramUsername', telegramUsername);

        await user.save();

        rmqService.sendToQueue(Queues.Socket, 'emit-to-user', {
            userId,
            emitType: EmitTypes.Verify,
            data: { user: await user.toShortInfo() }
        });
    }

    async validateUserPassword(
        userId: number,
        oldPassword: string
    ): Promise<void> {
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

    async changePassword(
        userId: number,
        oldPassword: string,
        newPassword: string
    ): Promise<User> {
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

    // типизировать
    async createProfileInfo(user: User) {
        const {
            id,
            nickname,
            firstName,
            lastName,
            birthDate,
            gender,
            avatar,
            avatarDecorationId
        } = user.toJSON();

        let avatarDecoration = null;

        if (avatarDecorationId) {
            avatarDecoration =
                await avatarDecorationService.createAvatarDecorationDtoById(
                    avatarDecorationId
                );
        }

        return {
            id,
            nickname,
            firstName,
            lastName,
            birthDate,
            gender,
            avatar: avatar ? process.env.STATIC_URL + avatar : null,
            avatarDecoration
        };
    }

    async getProfileInfo(userId: number): Promise<UserProfileInfo> {
        const user = await this.getUserById(userId);

        return await this.createProfileInfo(user);
    }

    async updateProfile(
        userId: number,
        firstName: string,
        lastName: string,
        birthDate: Date,
        gender: string
    ): Promise<UserProfileInfo> {
        const user = await this.getUserById(userId);

        if (
            (user.get('firstName') && !firstName) ||
            (user.get('lastName') && !lastName)
        ) {
            throw ApiError.badRequest('Нельзя удалить имя/фамилию');
        }

        user.set('firstName', firstName);
        user.set('lastName', lastName);
        user.set('birthDate', birthDate);
        user.set('gender', gender);

        await user.save();

        return await this.createProfileInfo(user);
    }

    async getUserSettings(userId: number) {
        const user = await this.getUserById(userId);
        return user.getSettings();
    }

    async updateSettings(
        userId: number,
        isPrivateAccount: boolean,
        isHideAvatars: boolean
    ): Promise<UserSettingsInfo> {
        const user = await this.getUserById(userId);

        user.set('isPrivateAccount', isPrivateAccount);
        user.set('isHideAvatars', isHideAvatars);

        await user.save();

        return { isPrivateAccount, isHideAvatars };
    }

    async setAvatar(
        userId: number,
        avatar: UploadedFile
    ): Promise<UserShortInfo> {
        const user = await User.findByPk(userId);

        await fileService.deleteFile(user.get('avatar'));

        const avatarPath = await fileService.saveFile('avatars', avatar);

        user.set('avatar', avatarPath);
        await user.save();

        return await user.toShortInfo();
    }

    async deleteAvatar(userId: number): Promise<UserShortInfo> {
        const user = await User.findByPk(userId);

        await fileService.deleteFile(user.get('avatar'));

        user.set('avatar', null);
        await user.save();

        return await user.toShortInfo();
    }

    async setAvatarDecoration(avatarDecorationId: number, userId: number) {
        await avatarDecorationService.getUserAvatarDecoration(
            avatarDecorationId,
            userId
        );

        const user = await User.findByPk(userId);

        user.set('avatarDecorationId', avatarDecorationId);
        await user.save();

        return await this.createProfileInfo(user);
    }

    async deleteAvatarDecoration(userId: number) {
        const user = await User.findByPk(userId);

        user.set('avatarDecorationId', null);
        await user.save();

        return await this.createProfileInfo(user);
    }

    async setTheme(themeId: number, userId: number) {
        await themeService.getUserTheme(themeId, userId);

        const user = await User.findByPk(userId);

        user.set('themeId', themeId);
        await user.save();

        return await this.createProfileInfo(user);
    }

    async deleteTheme(userId: number) {
        const user = await User.findByPk(userId);

        user.set('themeId', null);
        await user.save();

        return await this.createProfileInfo(user);
    }

    async getUser(nickname: string) {
        const user = await this.getUserByNickname(nickname);

        if (!user) {
            throw ApiError.notFound('Пользователь не найден');
        }

        return await this.createProfileInfo(user);
    }

    async searchUsers(
        userId: number,
        search: string,
        limit: number,
        offset: number
    ): Promise<PaginationDTO<UserPreview>> {
        const whereOptions = {
            id: {
                [Op.not]: userId
            },
            nickname: { [Op.iLike]: `%${search}%` }
        };

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

        return new PaginationDTO<UserPreview>(
            'users',
            userDTOs,
            totalCount,
            limit,
            offset
        );
    }

    async getUsersByUserIDs(
        userIDs: number[],
        limit: number,
        offset: number
    ): Promise<User[]> {
        return await User.findAll({
            where: {
                id: { [Op.in]: userIDs }
            },
            order: [['registrationDate', 'DESC']],
            limit,
            offset
        });
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

    async getStats() {
        const online = await rmqService.sendToQueue(Queues.Socket, 'online');

        const cachedAdminStats = await redisClient.get('stats');

        if (cachedAdminStats) {
            return {
                online,
                ...JSON.parse(cachedAdminStats)
            };
        }

        const usersCount = await User.count();

        const adminsCount = await UserRole.count({
            col: 'userId',
            distinct: true
        });

        const blockedUsersCount = await User.count({
            where: { isBlocked: true }
        });

        await redisClient.set(
            'stats',
            JSON.stringify({ usersCount, adminsCount, blockedUsersCount }),
            { EX: 15 }
        );

        return {
            online,
            usersCount,
            adminsCount,
            blockedUsersCount
        };
    }

    async getUsers(
        limit: number,
        offset: number,
        search?: string,
        blocked?: string,
        verified?: string,
        online?: string,
        hasRole?: string,
        roleId?: number,
        userIds?: number[],
        short?: string
    ): Promise<PaginationDTO<UserAdminInfo | UserPreview>> {
        const whereOptions: {
            [Op.or]?: Array<
                { id?: number } | { nickname?: { [Op.iLike]: string } }
            >;
            isBlocked?: boolean;
            isVerified?: boolean;
            id?: { [Op.in]: number[] };
        } = {};

        if (search) {
            whereOptions[Op.or] = [];

            if (!isNaN(Number(search))) {
                whereOptions[Op.or].push({ id: Number(search) });
            }

            whereOptions[Op.or].push({
                nickname: { [Op.iLike]: `%${search}%` }
            });
        }

        if (blocked) {
            whereOptions.isBlocked = blocked.toLowerCase() === 'true';
        }

        if (verified) {
            whereOptions.isVerified = verified.toLowerCase() === 'true';
        }

        const userIDsArrays: number[][] = [];

        if (online && online.toLowerCase() === 'true') {
            const onlineUserIds = (await rmqService.sendToQueue(
                Queues.Socket,
                'online-users'
            )) as number[];
            userIDsArrays.push(onlineUserIds);
        }

        if (hasRole && hasRole.toLowerCase() === 'true') {
            // вынести в roleService в getAdminIDs?
            const userRoles = await UserRole.findAll();

            userIDsArrays.push(
                userRoles.map(userRole => userRole.get('userId'))
            );
        }

        if (roleId) {
            // вынести в roleService в getAdminIDsbyRoleId?
            const userRoles = await UserRole.findAll({
                where: {
                    roleId
                }
            });

            userIDsArrays.push(
                userRoles.map(userRole => userRole.get('userId'))
            );
        }

        if (userIDsArrays.length || userIds) {
            whereOptions.id = {
                [Op.in]: getArraysIntersection(userIDsArrays).concat(userIds)
            };
        }

        const users = await User.findAll({
            where: whereOptions,
            order: [['registrationDate', 'DESC']],
            limit,
            offset
        });

        const usersDtos = await Promise.all(
            users.map(async user => {
                if (short && short.toLowerCase() == 'true') {
                    return user.toPreview();
                } else {
                    const activity = await rmqService.sendToQueue(
                        Queues.Socket,
                        'user-activity',
                        user.get('id')
                    );
                    return {
                        ...(await user.toAdminInfo()),
                        activity
                    };
                }
            })
        );

        const totalCount = await User.count({
            where: whereOptions
        });

        return new PaginationDTO<UserAdminInfo | UserPreview>(
            'users',
            usersDtos,
            totalCount,
            limit,
            offset
        );
    }

    async getAdminUserProfileInfo(userId: number) {
        const user = await this.getUserById(userId);

        let avatarDecoration = null;

        if (user.get('avatarDecorationId')) {
            avatarDecoration =
                await avatarDecorationService.createAvatarDecorationDtoById(
                    user.get('avatarDecorationId')
                );
        }

        const activity = await rmqService.sendToQueue(
            Queues.Socket,
            'user-activity',
            user.get('id')
        );

        return {
            id: user.get('id'),
            nickname: user.get('nickname'),
            firstName: user.get('firstName'),
            lastName: user.get('lastName'),
            isVerified: user.get('isVerified'),
            isBlocked: user.get('isBlocked'),
            blockReason: user.get('blockReason'),
            avatar: user.get('avatar')
                ? process.env.STATIC_URL + user.get('avatar')
                : null,
            avatarDecoration,
            status: 'Новичек',
            activity
        };
    }

    async getAdminUserBasicInfo(userId: number) {
        const user = await this.getUserById(userId);
        const { xp } = user.toJSON();
        const levelInfo = calculateLevelInfo(xp);
        const subscription = await user.getSubscription();

        const activity = await rmqService.sendToQueue(
            Queues.Socket,
            'activity-data',
            user.get('id')
        );

        return {
            levelInfo,
            balance: user.get('balance'),
            subscription,
            activity
        };
    }

    async setUserBlockStatus(
        adminId: number,
        userId: number,
        blockStatus: boolean,
        reason: string = null
    ): Promise<UserAdminInfo> {
        if (adminId == userId) {
            throw ApiError.badRequest(
                'Нельзя выполнять данное действие на самом себе'
            );
        }

        const user = await this.getUserById(userId);

        user.set('isBlocked', blockStatus);
        user.set('blockReason', reason);
        await user.save();

        rmqService.sendToQueue(Queues.Socket, 'emit-to-user', {
            userId,
            emitType: blockStatus ? EmitTypes.Blocked : EmitTypes.Unblocked,
            data: blockStatus ? { reason } : null
        });

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

        const userId = user.get('id');
        const { level: newLevel } = levelInfo;

        if (newLevel > oldLevel) {
            rmqService.sendToQueue(Queues.Socket, 'emit-to-user', {
                userId,
                emitType: EmitTypes.NewLevel,
                data: levelInfo
            });

            await achievementService.checkAchievementCompletion(
                userId,
                AchievementTypes.LVL,
                newLevel
            );
        }

        return await user.toShortInfo();
    }

    async getUserLevelInfoById(id: number) {
        const user = await this.getUserById(id);
        return calculateLevelInfo(user.get('xp'));
    }

    async addCoins(userId: number, amount: number) {
        const user = await this.getUserById(userId);
        const balance = user.get('balance');

        if (balance + amount < 0) {
            throw ApiError.badRequest(
                'Баланс пользователя не может быть отрицательным'
            );
        }

        user.set('balance', balance + amount);
        await user.save();

        return user.toAdminInfo();
    }

    async rewardUser(userId: number, xp: number, coins: number) {
        const user = await this.getUserById(userId);

        await user.increment('xp', { by: xp });
        await user.increment('balance', { by: coins });

        return await user.save();
    }

    async takePaymentForTheProduct({
        userId,
        price,
        requiredSubscriptionId,
        requiredAchievementId,
        seasonStartDate,
        seasonEndDate
    }: {
        userId: number;
        price: number;
        requiredSubscriptionId: number;
        requiredAchievementId: number;
        seasonStartDate: Date;
        seasonEndDate: Date;
    }) {
        const user = await User.findByPk(userId, {
            include: ['subscription', 'userAchievements']
        });

        const subscription = user.get('subscription');

        const userAchievementIds = user
            .get('userAchievements')
            .map(item => item.get('achievementId'));

        const now = new Date();

        if (
            requiredSubscriptionId &&
            (!subscription ||
                (!user.get('isSubscriptionPermanent') &&
                    user.get('subscriptionExpiredDate') < now) ||
                (user.get('subscriptionId') != requiredSubscriptionId &&
                    subscription.get('subscription') !=
                        Subscriptions.PremiumPlus))
        ) {
            throw ApiError.badRequest('У вас нет требуемой подписки');
        }

        if (
            requiredAchievementId &&
            !userAchievementIds.includes(requiredAchievementId)
        ) {
            throw ApiError.badRequest('У вас нет требуемого достижения');
        }

        if (
            seasonStartDate &&
            seasonEndDate &&
            (seasonStartDate > now || seasonEndDate < now)
        ) {
            throw ApiError.badRequest('Сезон еще не начался');
        }

        if (price > 0) {
            const balance = user.get('balance');

            if (balance < price) {
                throw ApiError.badRequest('Недостаточно средств');
            }

            user.set('balance', balance - price);
            await user.save();
        }
    }

    async removeSubscriptionFromUser(userId: number) {
        const user = await this.getUserById(userId);

        user.set('subscriptionId', null);
        user.set('subscriptionExpiredDate', null);
        user.set('isSubscriptionPermanent', null);

        await rmqService.sendToQueue(Queues.Socket, EmitTypes.Refresh, {
            userIds: [Number(userId)],
            action: 'subscription'
        });

        return await user.save();
    }

    // TODO: подумать как сделать на уровне бд чтобы при удалении становился null
    async resetProductByProductId(
        productField: 'avatarDecorationId' | 'themeId',
        id: number
    ) {
        return await User.update(
            { [productField]: null },
            { where: { [productField]: id } }
        );
    }

    async resetExpiredSubscriptions() {
        const usersWithExpiredSubscriptions  = await User.findAll({
            where: {
                isSubscriptionPermanent: false,
                subscriptionExpiredDate: {
                    [Op.lt]: new Date()
                }
            }
        });

        for (const user of usersWithExpiredSubscriptions ) {
            logger.info('Resetting a user expired subscription', {
                user: { id: user.get('id'), nickname: user.get('nickname') }
            });

            user.set('subscriptionId', null);
            user.set('subscriptionExpiredDate', null);

            await user.save();
        }
    }
}

export default new UserService();
