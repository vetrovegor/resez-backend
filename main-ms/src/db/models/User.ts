import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    BelongsToMany,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';

import {
    UserAdminInfo,
    UserPreview,
    UserProfileInfo,
    UserProfilePreview,
    UserShortInfo,
    UserTokenInfo
} from 'src/types/user';
import Session from './Session';
import Code from './Code';
import UserRole from './UserRole';
import Role from './roles/Role';
import Message from './messenger/Message';
import Chat from './messenger/Chat';
import UserChat from './messenger/UserChat';
import { PermissionDTO } from 'src/types/permission';
import { calculateLevelInfo } from '@utils';
import Activity from './Activity';
import Subscription from './subscription/Subscription';
import AvatarDecoration from './store/avatarDecoration/AvatarDecoration';
import UserAvatarDecoration from './store/avatarDecoration/UserAvatarDecoration';
import Feedback from './Feedback';
import Token from './Token';
import PromoCode from './promo/PromoCode';
import UserPromocode from './promo/UserPromoCode';
import Theme from './store/theme/Theme';
import UserTheme from './store/theme/UserTheme';
import Achievement from './achievement/Achievement';
import UserAchievement from './achievement/UserAchievement';

@Table({
    timestamps: false,
    tableName: 'users'
})
class User extends Model {
    @Column({
        type: DataType.STRING
    })
    nickname: string;

    @Column({
        type: DataType.STRING
    })
    password: string;

    @Column({
        type: DataType.STRING
    })
    telegramChatId: string;

    @Column({
        type: DataType.STRING
    })
    telegramUsername: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isVerified: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isBlocked: boolean;

    @Column({
        type: DataType.STRING
    })
    blockReason: string;

    @Column({
        type: DataType.BIGINT,
        defaultValue: 0
    })
    xp: number;

    @Column({
        type: DataType.INTEGER
    })
    activeStatusId: number;

    @Column({
        type: DataType.STRING
    })
    avatar: string;

    @Column({
        type: DataType.STRING
    })
    firstName: string;

    @Column({
        type: DataType.STRING
    })
    lastName: string;

    @Column({
        type: DataType.DATE
    })
    birthDate: Date;

    @Column({
        type: DataType.STRING
    })
    gender: string;

    @Column({
        type: DataType.DATE
    })
    registrationDate: Date;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isPrivateAccount: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isHideAvatars: boolean;

    // карточки
    // перемешивать
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isShuffleCards: boolean;

    // лицевая сторона - определение
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isDefinitionCardFront: boolean;

    // заучивание
    // перемешивать
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isShuffleMemorization: boolean;

    // тест
    // мгновенный показ ответа
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isInstantAnswerDisplay: boolean;

    // верно не верно
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isTrueFalseMode: boolean;

    // письменно
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isWriteMode: boolean;

    @HasMany(() => Session, {
        onDelete: 'CASCADE'
    })
    sessions: Session[];

    @HasMany(() => Token, {
        onDelete: 'CASCADE'
    })
    tokens: Token[];

    @HasMany(() => Code, {
        onDelete: 'CASCADE'
    })
    codes: Code[];

    @BelongsToMany(() => Role, () => UserRole)
    roles: Role[];

    @ForeignKey(() => Subscription)
    @Column
    subscriptionId: number;

    @BelongsTo(() => Subscription)
    subscription: Subscription;

    @Column({
        type: DataType.DATE
    })
    subscriptionExpiredDate: Date;

    @Column({
        type: DataType.BOOLEAN
    })
    isSubscriptionPermanent: boolean;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0
    })
    balance: number;

    @BelongsToMany(() => Chat, () => UserChat)
    chats: Chat[];

    @HasMany(() => UserChat, {
        onDelete: 'CASCADE'
    })
    userChats: UserChat[];

    @HasMany(() => Message, {
        onDelete: 'CASCADE'
    })
    messages: Message[];

    @HasMany(() => Activity)
    activity: Activity[];

    @BelongsToMany(() => AvatarDecoration, () => UserAvatarDecoration)
    avatarDecorations: AvatarDecoration[];

    @HasMany(() => UserAvatarDecoration, {
        onDelete: 'CASCADE'
    })
    userAvatarDecorations: UserAvatarDecoration[];

    @ForeignKey(() => AvatarDecoration)
    @Column
    avatarDecorationId: number;

    @BelongsTo(() => AvatarDecoration)
    avatarDecoration: AvatarDecoration;

    @BelongsToMany(() => Theme, () => UserTheme)
    themes: Theme[];

    @HasMany(() => UserTheme, {
        onDelete: 'CASCADE'
    })
    userThemes: UserTheme[];

    @ForeignKey(() => Theme)
    @Column
    themeId: number;

    @BelongsTo(() => Theme)
    theme: Theme;

    @HasMany(() => Feedback, {
        onDelete: 'CASCADE'
    })
    feedback: Feedback[];

    @HasMany(() => PromoCode, {
        onDelete: 'CASCADE'
    })
    createdPromoCodes: PromoCode[];

    @BelongsToMany(() => PromoCode, () => UserPromocode)
    promocodes: PromoCode[];

    @HasMany(() => UserPromocode, {
        onDelete: 'CASCADE'
    })
    userPromocodes: UserPromocode[];

    @BelongsToMany(() => Achievement, () => UserAchievement)
    achievements: Achievement[];

    @HasMany(() => UserAchievement, {
        onDelete: 'CASCADE'
    })
    userAchievements: UserAchievement[];

    async getRoles(): Promise<Role[]> {
        const userRoles = await UserRole.findAll({
            where: { userId: this.get('id') },
            attributes: [],
            include: [
                {
                    model: Role,
                    where: {
                        isArchived: false
                    }
                }
            ]
        });

        return userRoles.map(userRole => userRole.get('role'));
    }

    async getPermissions(): Promise<PermissionDTO[]> {
        const roles = await this.getRoles();
        const permissions: PermissionDTO[] = [];

        for (const role of roles) {
            const rolePermissions = await role.getPermissions();

            const rolePermissionDTOs = rolePermissions.map(permission =>
                permission.toDTO()
            );

            for (const permission of rolePermissionDTOs) {
                if (!permissions.some(p => p.id === permission.id)) {
                    permissions.push(permission);
                }
            }
        }

        return permissions;
    }

    async getSubscription() {
        const {
            subscriptionId,
            subscriptionExpiredDate,
            isSubscriptionPermanent
        } = this.get();

        if (
            !subscriptionId ||
            (!isSubscriptionPermanent && subscriptionExpiredDate < new Date())
        ) {
            return null;
        }

        const subscriptionData = await Subscription.findByPk(subscriptionId);

        return subscriptionData
            ? {
                  ...subscriptionData.toJSON(),
                  subscriptionExpiredDate,
                  isSubscriptionPermanent
              }
            : null;
    }

    async getTheme() {
        const { themeId } = this.get();

        if (!themeId) {
            return null;
        }

        const theme = await Theme.findByPk(themeId);
        const { id, primary, light } = theme.toJSON();

        return { id, primary, light };
    }

    async toTokenInfo(): Promise<UserTokenInfo> {
        const { id, nickname, telegramChatId } = this.get();

        const subscription = await this.getSubscription();

        const permissions = await this.getPermissions();

        return {
            id,
            nickname,
            telegramChatId,
            subscription,
            permissions
        };
    }

    async toShortInfo(): Promise<UserShortInfo> {
        const {
            id,
            nickname,
            isVerified,
            isBlocked,
            blockReason,
            avatar,
            xp,
            isPrivateAccount,
            isHideAvatars,
            balance,
            subscriptionExpiredDate,
            isSubscriptionPermanent
        } = this.get();

        const levelInfo = calculateLevelInfo(xp);

        const subscription = await this.getSubscription();

        const theme = await this.getTheme();

        return {
            id,
            nickname,
            isVerified,
            isBlocked,
            blockReason,
            avatar: avatar ? process.env.STATIC_URL + avatar : null,
            levelInfo,
            settings: {
                isPrivateAccount,
                isHideAvatars
            },
            balance,
            subscription,
            theme
        };
    }

    getSettings() {
        const { isPrivateAccount, isHideAvatars } = this.get();
        return { isPrivateAccount, isHideAvatars };
    }

    toPreview(): UserPreview {
        const { id, nickname, avatar } = this.get();

        return {
            id,
            nickname,
            avatar: avatar ? process.env.STATIC_URL + avatar : null
        };
    }

    async toAdminInfo(): Promise<UserAdminInfo> {
        const {
            id,
            nickname,
            firstName,
            lastName,
            registrationDate,
            telegramUsername,
            isVerified,
            isBlocked,
            blockReason,
            avatar,
            balance,
            subscriptionExpiredDate,
            isSubscriptionPermanent
        } = this.get();

        const rolesData = await this.getRoles();
        const roles = rolesData.map(role => role.toPreview());
        const subscription = await this.getSubscription();

        return {
            id,
            nickname,
            firstName,
            lastName,
            registrationDate,
            telegramUsername,
            isVerified,
            isBlocked,
            blockReason,
            avatar: avatar ? process.env.STATIC_URL + avatar : null,
            status: 'Новичек',
            levelInfo: {
                level: 1,
                xp: 400,
                limit: 500
            },
            roles,
            balance,
            subscription
        };
    }
}

export default User;
