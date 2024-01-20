import { Response, NextFunction } from 'express';

import { RequestWithBody } from 'types/request';
import { ApiError } from '../ApiError';
import { UserProfileInfo } from 'types/user';

export const userProfileMiddleware = async (req: RequestWithBody<UserProfileInfo>, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, birthDate, gender } = req.body;

        const firstNameLength = firstName.length;
        const lastNameLength = lastName.length;

        if (firstNameLength && (firstNameLength < 2 || firstNameLength > 20)) {
            throw ApiError.badRequest('Имя должно быть от 2 до 20 символов')
        }

        if (lastNameLength && (lastNameLength < 2 || lastNameLength > 30)) {
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