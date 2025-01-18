import { Response, NextFunction } from 'express';

import { RequestWithBody } from 'src/types/request';
import { ApiError } from '@ApiError';
import { UserProfileInfo } from 'src/types/user';

export const userProfileMiddleware = async (req: RequestWithBody<UserProfileInfo>, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, birthDate, gender } = req.body;

        if (firstName && (firstName.length < 2 || firstName.length > 20)) {
            throw ApiError.badRequest('Имя должно быть от 2 до 20 символов')
        }

        if (lastName && (lastName.length < 2 || lastName.length > 30)) {
            throw ApiError.badRequest('Фамилия должна быть от 2 до 30 символов')
        }

        if (birthDate && isNaN(Date.parse(birthDate.toString()))) {
            throw ApiError.badRequest('Некорректная дата рождения');
        }

        if (gender && gender != 'Мужской' && gender != 'Женский') {
            throw ApiError.badRequest('Некорректнное значение пола');
        }

        next();
    } catch (error) {
        return next(error);
    }
}