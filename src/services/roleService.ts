import Role from "../db/models/Role";
import { ApiError } from "../apiError";
import userService from "./userService";
import permissionService from "./permissionService";
import RolePermission from "../db/models/RolePermission";
import UserRole from "../db/models/UserRole";

class RoleService {
    // убрать в будущем
    async giveFullRoleToUser(nickname: string): Promise<void> {
        const existedUser = await userService.getUserByNickname(nickname);

        if (!existedUser) {
            throw ApiError.notFound('Пользователь не найден');
        }

        const createdRole = await Role.create({
            role: Date.now(),
            textColor: '#007CEE',
            backgroundColor: '#007CEE1A'
        });

        const permissions = await permissionService.getPermissons();

        for(const permission of permissions) {
            await RolePermission.create({
                roleId: createdRole.id,
                permissionId: permission.id
            });
        }

        await UserRole.create({
            userId: existedUser.id,
            roleId: createdRole.id
        });
    }
}

export default new RoleService();