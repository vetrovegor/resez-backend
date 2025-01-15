import { UploadedFile } from 'express-fileupload';
import { UserPreview } from './user';

export type MessageFileRequestBodyDTO = {
    url: string;
    name: string;
    type: string;
    size: number;
};

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
    parentMessageId: number;
};

export type ParentMessageDTO = {
    id: number;
    message: string;
    sender: UserPreview;
    files: MessageFileDTO[];
}

export type MessageDTO = {
    id: number;
    message: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    isEdited: boolean;
    sender: UserPreview;
    isRead: boolean;
    readers: (UserPreview & { readDate: Date })[];
    reactions: (UserPreview & { reaction: string, reactionDate: Date })[];
    chatId: number;
    files: MessageFileDTO[];
    parentMessage: ParentMessageDTO;
};

export type ChatDTO = {
    id: number;
    isGroup: boolean;
    chat: string;
    picture: string;
    membersCount: number;
    latestMessage: MessageDTO;
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
