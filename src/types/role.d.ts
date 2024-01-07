import { ExtendedPermissionDTO } from "./permission"

export type RoleBodyDto = {
    role: string,
    permissions: number[],
    textColor: string,
    backgroundColor: string
}

export type RoleShortInfo = {
    id: number,
    role: string,
    textColor: string,
    backgroundColor: string,
    permissionsCount: number,
    usersCount: number
}

export type RoleFullInfo = {
    id: number,
    role: string,
    textColor: string,
    backgroundColor: string,
    permissions: ExtendedPermissionDTO[]
}

export type AssignRoleBodyDto = {
    roleId: number,
    userId: number
}