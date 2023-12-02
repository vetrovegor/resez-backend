import {Op} from "sequelize";

import Permission from "../db/models/Permission";
import { Permissions } from "types/permission";

const permissionsHierarchy = [
    {
        permission: Permissions.Admin
    },
    {
        permission: Permissions.Users,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.BlockUsers,
        parent: Permissions.Users
    },
    {
        permission: Permissions.Notifies,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.Roles,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.CreateRoles,
        parent: Permissions.Roles
    },
    {
        permission: Permissions.UpdateRoles,
        parent: Permissions.Roles
    },
    {
        permission: Permissions.DeleteRoles,
        parent: Permissions.Roles
    },
    {
        permission: Permissions.IssueRoles,
        parent: Permissions.Roles
    },
    {
        permission: Permissions.Themes,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.CreateThemes,
        parent: Permissions.Themes
    },
    {
        permission: Permissions.UpdateThemes,
        parent: Permissions.Themes
    },
    {
        permission: Permissions.DeleteThemes,
        parent: Permissions.Themes
    },
    {
        permission: Permissions.Logs,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.Tests,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.CreateOfficialTests,
        parent: Permissions.Tests
    },
    {
        permission: Permissions.DeleteTests,
        parent: Permissions.Tests
    },
    {
        permission: Permissions.Subjects,
        parent: Permissions.Tests
    },
    {
        permission: Permissions.CreateSubjects,
        parent: Permissions.Subjects
    },
    {
        permission: Permissions.UpdateSubjects,
        parent: Permissions.Subjects
    },
    {
        permission: Permissions.DeleteSubjects,
        parent: Permissions.Subjects
    },
    {
        permission: Permissions.Tasks,
        parent: Permissions.Tests
    },
    {
        permission: Permissions.CreateTasks,
        parent: Permissions.Tasks
    },
    {
        permission: Permissions.UpdateTasks,
        parent: Permissions.Tasks
    },
    {
        permission: Permissions.DeleteTasks,
        parent: Permissions.Tasks
    },
    {
        permission: Permissions.VerifyTasks,
        parent: Permissions.Tasks
    },
    {
        permission: Permissions.Complaints,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.Archive,
        parent: Permissions.Admin
    }
];


class PermissionService {
    async initPermissions() {
        const permissions = [];

        for (const { permission, parent } of permissionsHierarchy) {
            const existedPermission = await this.getPermissionByPermission(permission);
            let parentId = null;

            if (parent) {
                const parentPermission = await this.getPermissionByPermission(parent);
                parentId = parentPermission.id;
            }

            if (existedPermission && existedPermission.get('parentId') != parentId) {
                existedPermission.set('parentId', parent ? parentId : null);
                await existedPermission.save();
            }

            if (!existedPermission) {
                await Permission.create({
                    permission,
                    parentId
                });
            }

            permissions.push(permission);
        }

        return await Permission.destroy({
            where: {
                permission: {
                    [Op.notIn]: permissions
                }
            }
        });
    }

    async getPermissionByPermission(permission: string): Promise<Permission> {
        return await Permission.findOne({
            where: {
                permission
            }
        });
    }

    async getPermissons(): Promise<Permission[]> {
        return await Permission.findAll();
    }
}

export default new PermissionService();