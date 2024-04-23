import { Response, NextFunction } from 'express';
import { RequestWithBody } from 'types/request';

export const groupUsersMiddleware = async (
    req: RequestWithBody<{ users: any }>,
    res: Response,
    next: NextFunction
) => {
    const { users } = req.body;

    if (!users) {
        req.body.users = [];
        return next();
    }

    if (!Array.isArray(users)) {
        req.body.users = [users];
    }

    return next();
};
