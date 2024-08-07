import User from 'db/models/User';
import { PermissionDTO } from './permission';
import { VerificationCodeData } from './code';
import { RolePreview } from './role';
import { SubscriptionDTO } from './subscription';
import Subscription from 'db/models/subscription/Subscription';

export type UserAuthDTO = {
    nickname: string;
    password: string;
};

export type UserTokenInfo = {
    id: number;
    nickname: string;
    telegramChatId: string;
    subscription: Subscription;
    permissions: PermissionDTO[];
};

export type UserShortInfo = {
    id: number;
    nickname: string;
    isVerified: boolean;
    isBlocked: boolean;
    blockReason: string;
    avatar: string;
    levelInfo: LevelInfo;
    settings: {
        isPrivateAccount: boolean;
        isHideAvatars: boolean;
    };
    permissions: PermissionDTO[];
    subscription: Subscription;
    balance: number;
};

export type AuthResponse = {
    user: User;
    verificationCodeData: VerificationCodeData;
};

export type UserRecoveryPasswordDTO = {
    nickname: string;
    code: string;
    password: string;
};

export type UserChangePasswordDTO = {
    oldPassword: string;
    newPassword: string;
    code: string;
};

export type UserPreview = {
    id: number;
    nickname: string;
    avatar: string;
};

export type UserChatPreview = UserPreview & {
    isAdmin: boolean;
    activity: {
        isOnline: boolean;
        lastSeen: Date;
    };
};

export type UserProfilePreview = {
    id: number;
    nickname: string;
    firstName: string;
    lastName: string;
    avatar: string;
};

export type UserProfileInfo = {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: string;
    avatar: string;
};

export type LevelInfo = {
    level: number;
    xp: number;
    limit: number;
};

export type UserAdminInfo = {
    id: number;
    nickname: number;
    firstName: string;
    lastName: string;
    registrationDate: Date;
    telegramUsername: string;
    isVerified: string;
    isBlocked: boolean;
    blockReason: string;
    avatar: string;
    status: string;
    levelInfo: LevelInfo;
    // theme: string,
    roles: RolePreview[];
    balance: number;
    subscription: { id: number; subscription: string };
};

export type UserSettingsInfo = {
    isPrivateAccount: boolean;
    isHideAvatars: boolean;
};

export type UserSearchQuery = {
    search: string;
};

export type UserFiltersQuery = {
    search: string;
    blocked: string;
    verified: string;
    online: string;
    has_role: string;
    role: number;
    short: string;
};
