import { Op } from "sequelize";

import Permission from "../../db/models/roles/Permission";
import { PermissionHierarchy, PermissionHierarchyItem, Permissions } from "types/permission";
import { ApiError } from "../../ApiError";

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
        permission: Permissions.AssignRoles,
        parent: Permissions.Roles
    },
    {
        permission: Permissions.Logs,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.Education,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.Subjects,
        parent: Permissions.Education
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
        parent: Permissions.Education
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
        permission: Permissions.Tests,
        parent: Permissions.Education
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
        permission: Permissions.Complaints,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.Archive,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.Store,
        parent: Permissions.Admin
    },
    {
        permission: Permissions.CreateProducts,
        parent: Permissions.Store
    },
    {
        permission: Permissions.UpdateProducts,
        parent: Permissions.Store
    },
    {
        permission: Permissions.DeleteProducts,
        parent: Permissions.Store
    },
    {
        permission: Permissions.AssignProducts,
        parent: Permissions.Store
    },
    {
        permission: Permissions.PublishProducts,
        parent: Permissions.Store
    },
    {
        permission: Permissions.PromoCodes,
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

    async getPermissionById(permissionId: number): Promise<Permission> {
        return await Permission.findByPk(permissionId);
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

    async validatePermissionIDs(permissionIDs: number[]): Promise<number[]> {
        permissionIDs = [...new Set(permissionIDs)];

        for (const permissionId of permissionIDs) {
            if (isNaN(permissionId)) {
                throw ApiError.badRequest(`Некорректное значение id: ${permissionId}`);
            }

            const existedPermission = await this.getPermissionById(permissionId);

            if (!existedPermission) {
                throw ApiError.badRequest(`permission с id ${permissionId} не найден`);
            }
        }

        return permissionIDs;
    }

    async getPermissionsHierarchy(): Promise<PermissionHierarchyItem[]> {
        const permissions = await Permission.findAll({
            raw: true
        });

        const permissionsMap: PermissionHierarchy = {};
        const topLevelPermissions: PermissionHierarchyItem[] = [];

        permissions.forEach((permissionItem) => {
            const { id, permission } = permissionItem;

            permissionsMap[id] = {
                id,
                permission,
                childrens: [],
            };
        });

        permissions.forEach((permissionItem) => {
            const { id, parentId } = permissionItem;

            if (parentId === null) {
                topLevelPermissions.push(permissionsMap[id]);
            } else {
                permissionsMap[parentId].childrens.push(permissionsMap[id]);
            }
        });

        return topLevelPermissions;
    }
}

export default new PermissionService();