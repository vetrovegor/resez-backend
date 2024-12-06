import { Type } from "@prisma/client";

export interface NotificationBody {
    type: Type;
    title: string;
    content: string;
    author: string;
    date: string;
    userIds: number[];
    isdDelayed: boolean;
}