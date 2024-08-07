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
} from 'types/user';
import Session from './Session';
import Code from './Code';
import UserRole from './UserRole';
import Role from './roles/Role';
import Message from './messenger/Message';
import Chat from './messenger/Chat';
import UserChat from './messenger/UserChat';
import { PermissionDTO } from 'types/permission';
import Notify from './notifies/Notify';
import UserNotify from './notifies/UserNotify';
import { calculateLevelInfo } from '../../utils';
import Activity from './Activity';
import MessageRead from './messenger/MessageRead';
import Subscription from './subscription/Subscription';
import AvatarDecoration from './store/AvatarDecorations';
import UserAvatarDecoration from './store/UserAvatarDecorations';

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
        type: DataType.INTEGER,
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

    @HasMany(() => Code, {
        onDelete: 'CASCADE'
    })
    codes: Code[];

    @BelongsToMany(() => Role, () => UserRole)
    roles: Role[];

    @BelongsToMany(() => Notify, () => UserNotify)
    notifies: Notify[];

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

    @HasMany(() => Notify, {
        onDelete: 'CASCADE'
    })
    sentNotifies: Notify[];

    @HasMany(() => UserNotify, {
        onDelete: 'CASCADE'
    })
    userNotifies: UserNotify[];

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

    @HasMany(() => MessageRead, {
        onDelete: 'CASCADE'
    })
    messageReads: MessageRead[];

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
        const { subscriptionId } = this.get();

        if (!subscriptionId) {
            return null;
        }

        const subscription = await Subscription.findByPk(subscriptionId);

        return subscription;
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
            balance
        } = this.get();

        const permissions = await this.getPermissions();

        const levelInfo = calculateLevelInfo(xp);

        const subscription = await this.getSubscription();

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
            permissions,
            subscription,
            balance
        };
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
            balance
        } = this.get();

        const rolesData = await this.getRoles();
        const roles = rolesData.map(role => role.toPreview());
        const subscriptionData = await this.getSubscription();

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
            subscription: subscriptionData
                ? {
                      id: subscriptionData.get('id'),
                      subscription: subscriptionData.get('subscription')
                  }
                : null
        };
    }
}

export default User;
