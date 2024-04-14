import { UploadedFile } from "express-fileupload"
import { UserPreview } from "./user"

export const enum MessageTypes {
    Default = 'Обычное',
    Deleted = 'Удаленное',
    System = 'Системное',
    Voice = 'Голосовое',
    Video = 'Видео'
}

export type MessageRequestBodyDTO = {
    message: string
}

export type MessageDTO = MessageRequestBodyDTO & {
    id: number,
    type: string,
    createdAt: Date,
    updatedAt: Date,
    isEdited: boolean,
    sender: UserPreview,
    chatId: number
}

export type ChatDTO = {
    id: number,
    isGroup: boolean,
    chat: string,
    picture: string,
    membersCount: number,
    lastMessage: MessageDTO
}

export type GroupCreateRequestDTO = {
    chat: string,
    users: number[],
    picture: UploadedFile
}

export type UserChatParams = {
    userId: number,
    chatId: number
}