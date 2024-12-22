import { UploadedFile } from 'express-fileupload';
import { UserPreview } from './user';

export const enum MessageTypes {
    Default = 'Обычное',
    Deleted = 'Удаленное',
    System = 'Системное',
    Voice = 'Голосовое',
    Video = 'Видео'
}

export type MessageFileRequestBodyDTO = {
    url: string;
    name: string;
    type: string;
    size: number;
}

export type MessageFileDTO = {
    id: number;
    url: string;
    name: string;
    type: string;
    size: string;
};

export type MessageRequestBodyDTO = {
    message: string;
    files: MessageFileRequestBodyDTO[];
};

export type MessageDTO = {
    id: number;
    message: string,
    type: string;
    createdAt: Date;
    updatedAt: Date;
    isEdited: boolean;
    sender: UserPreview;
    readsCount: number;
    chatId: number;
    files: MessageFileDTO[];
};

export type MessageReader = {
    user: UserPreview;
    date: Date;
};

export type ChatDTO = {
    id: number;
    isGroup: boolean;
    chat: string;
    picture: string;
    membersCount: number;
    lastMessage: MessageDTO;
};

export type GroupCreateRequestDTO = {
    chat: string;
    users: number[];
    picture: UploadedFile;
};

export type UserChatParams = {
    userId: number;
    chatId: number;
};
