import { sendToQueue } from './rmqService';

const SOCKET_QUEUE = 'socket-queue';

export const emitToUser = async (
    userId: number,
    emitType: string,
    data: any
) => {
    return await sendToQueue(SOCKET_QUEUE, 'emit-to-user', {
        userId,
        emitType,
        data
    });
};
