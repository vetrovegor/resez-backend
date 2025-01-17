import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { accessTokenMiddleware } from '@middlewares/accessTokenMiddleware';
import { paginationMiddleware } from '@middlewares/paginationMiddleware';
import chatController from '@controllers/messenger/chatController';
import { fileMiddleware } from '@middlewares/fileMiddleware';
import { imageMiddleware } from '@middlewares/imageMiddleware';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import { groupUsersMiddleware } from '@middlewares/messenger/groupUsersMiddleware';

export const chatRouter = Router();

chatRouter.get(
    '/',
    paginationMiddleware,
    accessTokenMiddleware(true),
    chatController.getUserChats
);

chatRouter.post(
    '/',
    body('chat').isLength({ min: 1 }),
    validationMiddleware,
    fileMiddleware(2, false),
    imageMiddleware,
    accessTokenMiddleware(true),
    groupUsersMiddleware,
    chatController.createGroup
);

chatRouter.post(
    '/:id/picture',
    param('id').isNumeric(),
    validationMiddleware,
    fileMiddleware(2),
    imageMiddleware,
    accessTokenMiddleware(true),
    chatController.setPicture
);

chatRouter.delete(
    '/:id/picture',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    chatController.deletePicture
);

// добавить мидлвейр что есть такой пользователь, чат и чат явдяется группой
chatRouter.post(
    '/:chatId/add-user/:userId',
    param('chatId').isNumeric(),
    param('userId').isNumeric(),
    body('showHistory').isBoolean(),
    validationMiddleware,
    accessTokenMiddleware(true),
    chatController.addUserToChat
);

// добавить мидлвейр что есть такой пользователь, чат и чат явдяется группой
chatRouter.delete(
    '/:chatId/remove-user/:userId',
    param('chatId').isNumeric(),
    param('userId').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    chatController.removeUserFromChat
);

chatRouter.get(
    '/unread-count',
    accessTokenMiddleware(true),
    chatController.getUnreadChatsCount
);

chatRouter.get(
    '/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    chatController.getChatInfo
);

chatRouter.get(
    '/:id/user',
    param('id').isNumeric(),
    validationMiddleware,
    paginationMiddleware,
    accessTokenMiddleware(true),
    chatController.getChatUsers
);

chatRouter.get(
    '/:id/user',
    param('id').isNumeric(),
    validationMiddleware,
    paginationMiddleware,
    accessTokenMiddleware(true),
    chatController.getChatUsers
);

chatRouter.get(
    '/link/:inviteLink',
    accessTokenMiddleware(true),
    chatController.getChatByInviteLink
);

chatRouter.get(
    '/join/:inviteLink',
    accessTokenMiddleware(true),
    chatController.joinChatViaLink
);

chatRouter.delete(
    '/:id/leave',
    param('id').isNumeric(),
    query('clear_history').isBoolean().optional(),
    validationMiddleware,
    accessTokenMiddleware(true),
    chatController.leaveChat
);

chatRouter.get(
    '/:id/return',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    chatController.returnToChat
);

chatRouter.delete(
    '/:id/history',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    chatController.clearHistory
);

chatRouter.patch(
    '/:id/read',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    chatController.readAllChat
);

chatRouter.post(
    '/:id/typing',
    param('id').isNumeric(),
    body('isTyping').isBoolean(),
    validationMiddleware,
    accessTokenMiddleware(true),
    chatController.handleTyping
);

chatRouter.get(
    '/:id/message',
    param('id').isNumeric(),
    validationMiddleware,
    paginationMiddleware,
    accessTokenMiddleware(true),
    chatController.getMessagesByChatId
);
