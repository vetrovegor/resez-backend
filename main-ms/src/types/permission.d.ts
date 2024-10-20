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
    Logs = 'Логирование',
    Education = 'Обучение',
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
    Archive = 'Архив',
    Store = 'Магазин',
    CreateProducts = 'Создание товаров',
    UpdateProducts = 'Редактирование товаров',
    DeleteProducts = 'Удаление товаров',
    AssignProducts = 'Выдача товаров',
    PublishProducts = 'Публикация товаров',
    PromoCodes = 'Промокоды'
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