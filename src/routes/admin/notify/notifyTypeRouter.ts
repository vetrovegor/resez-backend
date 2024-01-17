import { Router } from "express";


import notifyTypeController from "../../../controllers/notify/notifyTypeController";
import { accessTokenMiddleware } from "../../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../../middlewares/blockedMiddleware";
import { permissionMiddleware } from "../../../middlewares/permissionMiddleware";
import { Permissions } from "types/permission";

export const notifyTypeRouter = Router();

notifyTypeRouter.get(
    '/',
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Notifies),
    notifyTypeController.getNotifyTypes
);