import { PermissionDto } from "./permission"

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
    level: number
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