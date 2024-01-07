import { Router } from "express";

import { chatRouter } from "./chatRouter";

export const messengerRouter = Router();

messengerRouter.use('/chat', chatRouter);