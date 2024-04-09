export const enum Permissions {
    Admin = 'Админка',
    Users = 'Пользователи',
    BlockUsers = 'Блокировка пользователей',
    Notifies = 'Отправка уведомлений',
    Roles = 'Роли',
    CreateRoles = 'Создание ролей',
    UpdateRoles = 'Редактирование ролей',
    DeleteRoles = 'Удаление ролей',
    AssignRoles = 'Выдача ролей',
    Themes = 'Темы',
    CreateThemes = 'Создание тем',
    UpdateThemes = 'Редактирование тем',
    DeleteThemes = 'Удаление тем',
    Logs = 'Логирование',
    Tests = 'Тесты',
    CreateOfficialTests = 'Создание официальных тестов',
    DeleteTests = 'Удаление тестов',
    Subjects = 'Предметы',
    CreateSubjects = 'Создание предметов',
    UpdateSubjects = 'Редактирование предметов',
    DeleteSubjects = 'Удаление предметов',
    Tasks = 'Задания',
    CreateTasks = 'Создание заданий',
    UpdateTasks = 'Редактирование заданий',
    DeleteTasks = 'Удаление заданий',
    VerifyTasks = 'Верификация заданий',
    Complaints = 'Жалобы',
    Archive = 'Архив'
}

export type PermissionDTO = {
    id: number,
    permission: string
}

export type ExtendedPermissionDTO = PermissionDTO & {
    isActive: boolean;
};

export type PermissionHierarchyItem = {
    id: number,
    permission: string,
    childrens: PermissionHierarchyItem[]
}

export type PermissionHierarchy = {
    [id: number]: PermissionHierarchyItem;
};