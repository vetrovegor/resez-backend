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