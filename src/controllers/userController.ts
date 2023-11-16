import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { ApiError } from '../apiError';
import codeService from '../services/codeService';
import userService from '../services/userService';
import { RequestWithBodyAndUserTokenInfo } from 'types/request';
import { UserChangePasswordDTO } from 'types/user';

class UserhController {
    async sendChangePasswordCode(req: RequestWithBodyAndUserTokenInfo<UserChangePasswordDTO>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            const { oldPassword } = req.body;

            await codeService.sendChangePasswordCode(req.user.id, oldPassword);

            res.send();
        } catch (error) {
            next(error);
        }
    }

    async verifyChangePasswordCode(req: RequestWithBodyAndUserTokenInfo<UserChangePasswordDTO>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            const { id } = req.user;
            const { oldPassword, newPassword, code } = req.body;

            await codeService.verifyChangePasswordCode(id, code);
            await userService.changePassword(id, oldPassword, newPassword);

            res.send();
        } catch (error) {
            next(error);
        }
    }
}

export default new UserhController();