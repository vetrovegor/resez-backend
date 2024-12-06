import { Type } from '@prisma/client';
import { prisma } from '../prisma';
import { NotificationBody } from '../types/notification';

export const createUserNotification = async (
    notificationBody: NotificationBody,
    senderId: number
) => {
    console.log({ notificationBody });
    return 1;
};

export const createNotification = async (
    {
        type,
        title,
        content,
        author,
        date,
        userIds,
        isdDelayed
    }: NotificationBody,
    senderId: number
) => {
    const notification = await prisma.notification.create({
        data: {
            type,
            title,
            content,
            author,
            senderId
        }
    });
    return 1;
};
