import { Type } from "@prisma/client";

export interface NotificationBody {
    type: Type;
    title: string;
    content: string;
    author: string;
    sendAt: string;
    userIds: number[];
    isDelayed: boolean;
}