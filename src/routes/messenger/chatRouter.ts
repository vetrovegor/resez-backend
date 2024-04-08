import { Router } from "express";
import { body, param } from "express-validator";

import { accessTokenMiddleware } from "../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../middlewares/blockedMiddleware";
import { paginationMiddleware } from "../../middlewares/paginationMiddleware";
import chatController from "../../controllers/messenger/chatController";
import { fileMiddleware } from "../../middlewares/fileMiddleware";
import { imageMiddleware } from "../../middlewares/imageMiddleware";
import { validationMiddleware } from "../../middlewares/validationMiddleware";


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
    body('users').isArray(),
    validationMiddleware,
    fileMiddleware(2, false),
    imageMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.createGroup
);

// добавить мидлвейр что есть такой пользователь, чат и чат явдяется группой
chatRouter.post(
    '/:chatId/add-user/:userId',
    param('chatId').isNumeric(),
    param('userId').isNumeric(),
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
    '/:chatId',
    accessTokenMiddleware,
    blockedMiddleware,
    chatController.getChatInfo
);