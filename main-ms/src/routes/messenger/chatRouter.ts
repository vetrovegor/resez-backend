import { Router } from "express";
import { body, param } from "express-validator";

import { accessTokenMiddleware } from "../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../middlewares/blockedMiddleware";
import { paginationMiddleware } from "../../middlewares/paginationMiddleware";
import chatController from "../../controllers/messenger/chatController";
import { fileMiddleware } from "../../middlewares/fileMiddleware";
import { imageMiddleware } from "../../middlewares/imageMiddleware";
import { validationMiddleware } from "../../middlewares/validationMiddleware";
import { groupUsersMiddleware } from "../../middlewares/groupUsersMiddleware";


export const chatRouter = Router();

chatRouter.get(
    '/',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.getUserChats
);

chatRouter.post(
    '/',
    body('chat').isLength({ min: 1 }),
    // body('users').isArray().optional(),
    groupUsersMiddleware,
    validationMiddleware,
    fileMiddleware(2, false),
    imageMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.createGroup
);

chatRouter.post(
    '/:id/picture',
    fileMiddleware(2),
    imageMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.setPicture
);

chatRouter.delete(
    '/:id/picture',
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.deletePicture
);

// добавить мидлвейр что есть такой пользователь, чат и чат явдяется группой
chatRouter.post(
    '/:chatId/add-user/:userId',
    param('chatId').isNumeric(),
    param('userId').isNumeric(),
    body('showHistory').isBoolean(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.addUserToChat
);

// добавить мидлвейр что есть такой пользователь, чат и чат явдяется группой
chatRouter.delete(
    '/:chatId/remove-user/:userId',
    param('chatId').isNumeric(),
    param('userId').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.removeUserFromChat
);

chatRouter.get(
    '/:id',
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.getChatInfo
);

chatRouter.get(
    '/:id/user',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.getChatUsers
);

chatRouter.get(
    '/:id/user',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.getChatUsers
);

chatRouter.get(
    '/join/:inviteLink',
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.joinChatViaLink
);

chatRouter.delete(
    '/:id/leave',
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.leaveChat
);

chatRouter.get(
    '/:id/return',
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.returnToChat
);

chatRouter.delete(
    '/:id/history',
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.clearHistory
);