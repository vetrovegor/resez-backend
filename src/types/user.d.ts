import User from "db/models/User"
import { PermissionDTO } from "./permission"
import { VerificationCodeData } from "./code"
import { RolePreview } from "./role"

export type UserAuthDTO = {
    nickname: string,
    password: string
}

export type UserTokenInfo = {
    id: number,
    nickname: string
}

export type UserShortInfo = {
    id: number,
    nickname: string,
    isVerified: boolean,
    isBlocked: boolean,
    blockReason: string,
    avatar: string,
    levelInfo: LevelInfo,
    settings: {
        isPrivateAccount: boolean,
        isHideAvatars: boolean
    }
    permissions: PermissionDTO[],
    unreadNotifiesCount: number
}

export type AuthResponse = {
    user: User,
    verificationCodeData: VerificationCodeData
}

export type UserRecoveryPasswordDTO = {
    nickname: string
    code: string
    password: string
}

export type UserChangePasswordDTO = {
    oldPassword: string
    newPassword: string
    code: string
}

export type UserPreview = {
    id: number,
    nickname: string,
    avatar: string
}

export type UserProfileInfo = {
    id: number,
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: string;
}

export type LevelInfo = {
    level: number,
    xp: number,
    limit: number
};

export type UserAdminInfo = {
    id: number,
    nickname: number,
    firstName: string,
    lastName: string,
    registrationDate: Date,
    isVerified: string,
    isBlocked: boolean,
    blockReason: string,
    avatar: string,
    isOnline: boolean,
    lastActivity: Date,
    status: string,
    levelInfo: LevelInfo,
    // theme: string,
    roles: RolePreview[]
}

export type UserSettingsInfo = {
    isPrivateAccount: boolean,
    isHideAvatars: boolean
}

export type UserSearchQuery = {
    search: string
};