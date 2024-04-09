import { Response, NextFunction } from "express";

import { ApiError } from "../ApiError";
import { NotifyTypes, SendNotifiesDTO } from "types/notify";
import { RequestWithBody } from "types/request";
import userService from "../services/userService";
import notifyTypeService from "../services/notifies/notifyTypeService";

export const notifyBodyMiddleware = async (req: RequestWithBody<SendNotifiesDTO>, res: Response, next: NextFunction) => {
    try {
        let { notifyTypeId, users, date } = req.body;

        // валидация типа
        if (!notifyTypeId) {
            notifyTypeId = await notifyTypeService.getNotifyTypeIdByType(NotifyTypes.Info);
        } else {
            await notifyTypeService.getNotifyTypeById(notifyTypeId);
        }

        // валидация пользователей
        let validatedUserIDs = await userService.validateUserIDs(users);

        if (!validatedUserIDs.length) {
            validatedUserIDs = await userService.getAllUserIDs();
        }

        // валидация даты
        const currentDate = new Date();

        if (date) {
            if (new Date(date) < currentDate) {
                throw ApiError.badRequest('Некорректная дата');
            }
        } else {
            date = currentDate.toISOString();
        }

        req.body.notifyTypeId = notifyTypeId;
        req.body.date = date;
        req.body.users = validatedUserIDs;
        req.body.isdDelayed = Number(new Date(date)) - Number(currentDate) > 0;

        next();
    } catch (error) {
        next(error);
    }
}