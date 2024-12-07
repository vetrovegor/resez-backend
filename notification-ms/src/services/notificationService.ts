import { Notification, UserNotification } from '@prisma/client';
import { prisma } from '../prisma';
import { NotificationBody } from '../types/notification';
import { HttpError } from '../HttpError';

export const createUserNotification = async (
    notification: Notification,
    userId: number
) => {
    await prisma.userNotification.create({
        data: {
            notificationId: notification.id,
            userId
        }
    });

    if (!notification.isDelayed) {
        // TODO: отправка в сокет
    }
};

export const createNotification = async (
    {
        type,
        title,
        content,
        author,
        sendAt,
        isDelayed,
        userIds
    }: NotificationBody,
    senderId: number
) => {
    const notification = await prisma.notification.create({
        data: {
            type,
            title,
            content,
            author,
            senderId,
            isDelayed,
            sendAt
        }
    });

    for (const userId of userIds) {
        await createUserNotification(notification, Number(userId));
    }
};

const createNotificationDto = ({
    isRead,
    notification
}: UserNotification & { notification: Notification }) => {
    const { id, type, title, content, author, sendAt: date } = notification;
    return { id, type, title, content, author, date, isRead };
};

export const getUserNotifications = async (
    userId: number,
    take: number,
    skip: number,
    unread?: string
) => {
    const where = {
        userId,
        notification: { isDelayed: false },
        ...(unread && { isRead: unread.toLowerCase() != 'true' })
    };

    const notificationsData = await prisma.userNotification.findMany({
        where,
        include: { notification: true },
        take,
        skip
    });

    const notifications = notificationsData.map(notification =>
        createNotificationDto(notification)
    );

    const totalCount = await prisma.userNotification.count({ where });

    return {
        notifications,
        totalCount,
        isLast: totalCount <= take + skip,
        elementsCount: notifications.length
    };
};

export const getUnreadNotificationsCount = async (userId: number) => {
    return await prisma.userNotification.count({
        where: {
            userId,
            isRead: false,
            notification: { isDelayed: false }
        }
    });
};

export const readNotification = async (
    notificationId: number,
    userId: number
) => {
    const userNotification = await prisma.userNotification.findFirst({
        where: {
            notificationId,
            userId,
            isRead: false,
            notification: { isDelayed: false }
        }
    });

    if (!userNotification) {
        throw new HttpError(404, 'Уведомление не найдено');
    }

    return await prisma.userNotification.update({
        where: {
            notificationId_userId: {
                notificationId,
                userId
            }
        },
        data: {
            isRead: true
        }
    });
};

export const readAllNotifications = async (userId: number) => {
    return await prisma.userNotification.updateMany({
        where: {
            userId,
            isRead: false,
            notification: { isDelayed: false }
        },
        data: {
            isRead: true
        }
    });
};
