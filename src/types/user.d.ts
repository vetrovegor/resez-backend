import User from "db/models/User"
import { PermissionDTO } from "./permission"
import { VerificationCodeData } from "./code"

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
    avatar: string,
    level: number,
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

export type UserSettingsInfo = {
    isPrivateAccount: boolean,
    isHideAvatars: boolean
}

export type UserSearchQuery = {
    search: string
};