import { Router } from 'express';

import { chatRouter } from './chatRouter';
import { messageRouter } from './messageRouter';

export const messengerRouter = Router();

messengerRouter.use('/chat', chatRouter);

messengerRouter.use('/message', messageRouter);
