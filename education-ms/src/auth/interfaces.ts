export interface JwtPayload {
    id: number;
    nickname: string;
    telegramChatId: string;
    subscription: {
        name: string;
        canUploadImages: boolean;
    };
    permissions: {
        id: number;
        permission: string;
    }[];
}

export const enum Permissions {
    Subjects = 'Предметы',
    CreateSubjects = 'Создание предметов',
    UpdateSubjects = 'Редактирование предметов',
    DeleteSubjects = 'Удаление предметов',
    Tasks = 'Задания',
    CreateTasks = 'Создание заданий',
    UpdateTasks = 'Редактирование заданий',
    DeleteTasks = 'Удаление заданий',
    VerifyTasks = 'Верификация заданий',
    Archive = 'Архив'
}
