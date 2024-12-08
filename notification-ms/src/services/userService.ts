import { sendToQueue } from './rmqService';

const USER_QUEUE = 'user-queue';

export const getById = async (userId: number) => {
    return await sendToQueue(USER_QUEUE, 'preview', userId);
};

export const getAllUserIDs = async () => {
    return (await sendToQueue(USER_QUEUE, 'get-all-ids')) as number[];
};

export const validateUserIds = async (userIds: number[]) => {
    const allUserIds = await getAllUserIDs();
    return allUserIds && userIds.every(userId => allUserIds.includes(userId));
};
