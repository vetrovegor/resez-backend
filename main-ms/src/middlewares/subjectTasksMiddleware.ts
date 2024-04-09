import { Response, NextFunction } from "express";

import { ApiError } from "../ApiError";
import { RequestWithBody } from "types/request";
import { SubjectBodyDTO } from "types/education";

// переименовать
export const subjectTasksMiddleware = async (req: RequestWithBody<SubjectBodyDTO>, res: Response, next: NextFunction) => {
    try {
        const { subjectTasks, durationMinutes } = req.body;

        let totalPrimaryScore = 0;

        subjectTasks.forEach(subjectTask => {
            const primaryScore = Number(subjectTask.primaryScore);

            totalPrimaryScore += primaryScore;

            let subThemes: string[] = [];

            subjectTask.subThemes.forEach(({ subTheme }) => {
                subThemes.push(subTheme);
            });

            if (new Set(subThemes).size != subThemes.length) {
                throw ApiError.badRequest('Не должно быть повторяющихся подтем');
            }
        });

        if (totalPrimaryScore < 1 || totalPrimaryScore > 100) {
            throw ApiError.badRequest('Сумма первичных баллов должна быть от 1 до 100');
        }

        if (durationMinutes < 1) {
            throw ApiError.badRequest('Длительность в минутах должна быть положительным числом');
        }

        next();
    } catch (error) {
        next(error);
    }
}