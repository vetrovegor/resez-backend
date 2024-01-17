export const enum NotifyTypes {
    Info = 'Информация',
    Session = 'Сессия',
    Gift = 'Подарок',
    Votting = 'Голосование',
    Adding = 'Добавление'
}

export type SendNotifiesDTO = {
    notifyTypeId: number,
    title: string,
    content: string,
    author: string,
    users: number[],
    date: string,
    isdDelayed: boolean
}

export type NotifyDTO = {
    id: number,
    type: string,
    title: string,
    content: string,
    author: string,
    date: Date,
    isRead: boolean
}

export type UserNotifyQuery = {
    unread: string
}