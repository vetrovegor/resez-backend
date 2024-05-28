import { Response, NextFunction } from 'express';
import { RequestWithBodyAndUser } from 'types/request';

export const groupUsersMiddleware = async (
    req: RequestWithBodyAndUser<{ users: any }>,
    res: Response,
    next: NextFunction
) => {
    const { users } = req.body;
    const adminId = req.user.id;

    if (!users) {
        req.body.users = [adminId];
        return next();
    }

    if (!Array.isArray(users)) {
        req.body.users = [users];
    }

    if (!req.body.users.includes(adminId.toString())) {
        req.body.users.push(adminId);
    }

    return next();
};
