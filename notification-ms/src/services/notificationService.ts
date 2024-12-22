import { Notification, UserNotification } from '@prisma/client';
import { prisma } from '../prisma';
import { NotificationBody } from '../types/notification';
import { HttpError } from '../HttpError';
import { getUserById } from './userService';
import { emitToUser } from './socketService';

const NOTIFICATION_EMIT_TYPE = 'notification';

export const createUserNotification = async (
    notification: Notification,
    userId: number
) => {
    const userNotification = await prisma.userNotification.create({
        data: {
            notificationId: notification.id,
            userId
        },
        include: { notification: true }
    });

    if (!notification.isDelayed) {
        const dto = createUserNotificationDto(userNotification);
        emitToUser(userId, NOTIFICATION_EMIT_TYPE, dto);
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

export const getNotifications = async (
    take: number,
    skip: number,
    delayed?: string,
    senderId?: number
) => {
    const where = {
        isDelayed: !!delayed && delayed.toLowerCase() == 'true',
        ...(senderId && { senderId })
    };

    const notificationsData = await prisma.notification.findMany({
        where,
        orderBy: { sendAt: 'desc' },
        take,
        skip
    });

    const notifications = await Promise.all(
        notificationsData.map(
            async notification => await createNotificationDto(notification)
        )
    );

    const totalCount = await prisma.notification.count({ where });

    return {
        notifications,
        totalCount,
        isLast: totalCount <= take + skip,
        elementsCount: notifications.length
    };
};

export const createNotificationDto = async (notification: Notification) => {
    const {
        id,
        title,
        content,
        author,
        senderId,
        sendAt: date,
        createdAt,
        updatedAt,
        type
    } = notification;

    const user = await getUserById(senderId);

    return {
        id,
        title,
        content,
        author,
        date,
        updatedAt,
        type,
        user,
        // TODO: добавить это поле в модель и вручную изменять его, когда кто-то реально редактирует
        isEdited: createdAt.toString() != updatedAt.toString()
    };
};

export const getNotificationById = async (id: number) => {
    const notification = await prisma.notification.findFirst({ where: { id } });

    if (!notification) {
        throw new HttpError(404, 'Уведомление не найдено');
    }

    return await createNotificationDto(notification);
};

export const deleteNotificationById = async (id: number) => {
    await getNotificationById(id);

    return await prisma.notification.delete({ where: { id } });
};

export const updateNotificationById = async (
    id: number,
    { type, title, content, author, userIds }: NotificationBody
) => {
    const existingNotification = await prisma.notification.findFirst({
        where: { id },
        include: { userNotification: true }
    });

    if (!existingNotification) {
        throw new HttpError(404, 'Уведомление не найдено');
    }

    const updatedNotification = await prisma.notification.update({
        where: { id },
        data: {
            type,
            title,
            content,
            author
        }
    });

    const notificationUserIds = existingNotification.userNotification.map(
        item => item.userId
    );

    const newUserIds = userIds.filter(
        userId => !notificationUserIds.includes(userId)
    );

    const userIdsToRemove = notificationUserIds.filter(
        userId => !userIds.includes(userId)
    );

    for (const userId of newUserIds) {
        await createUserNotification(updatedNotification, userId);
    }

    await prisma.userNotification.deleteMany({
        where: {
            notificationId: id,
            userId: { in: userIdsToRemove }
        }
    });
};

export const getUserNotificationsForAdmin = async (
    id: number,
    take: number,
    skip: number,
    unread?: string
) => {
    const where = {
        notification: { id },
        ...(unread && { isRead: unread.toLowerCase() != 'true' })
    };

    const notificationsData = await prisma.userNotification.findMany({
        where,
        take,
        skip
    });

    const users = await Promise.all(
        notificationsData.map(async ({ userId, isRead, updatedAt }) => {
            const user = await getUserById(userId);

            return {
                ...user,
                isRead,
                updatedAt
            };
        })
    );

    const totalCount = await prisma.userNotification.count({ where });

    return {
        users,
        totalCount,
        isLast: totalCount <= take + skip,
        elementsCount: users.length
    };
};

export const sendDelayedNotifications = async () => {
    const where = {
        isDelayed: true,
        sendAt: {
            lte: new Date()
        }
    };

    const notificationsToSend = await prisma.notification.findMany({
        where,
        include: { userNotification: { include: { notification: true } } }
    });

    for (const notification of notificationsToSend) {
        for (const userNotification of notification.userNotification) {
            const dto = createUserNotificationDto(userNotification);
            await emitToUser(
                userNotification.userId,
                NOTIFICATION_EMIT_TYPE,
                dto
            );
        }
    }

    await prisma.notification.updateMany({
        where,
        data: {
            isDelayed: false
        }
    });
};

const createUserNotificationDto = ({
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
        orderBy: { notification: { sendAt: 'desc' } },
        take,
        skip
    });

    const notifications = notificationsData.map(notification =>
        createUserNotificationDto(notification)
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
