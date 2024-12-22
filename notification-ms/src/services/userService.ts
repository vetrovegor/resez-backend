import { UserPreview } from '../types/user';
import { sendToQueue } from './rmqService';

const USER_QUEUE = 'user-queue';

export const getUserById = async (userId: number) => {
    return (await sendToQueue(USER_QUEUE, 'preview', userId)) as UserPreview;
};

export const getAllUserIDs = async () => {
    return (await sendToQueue(USER_QUEUE, 'get-all-ids')) as number[];
};

export const validateUserIds = async (userIds: number[]) => {
    const allUserIds = await getAllUserIDs();
    return allUserIds && userIds.every(userId => allUserIds.includes(Number(userId)));
};
