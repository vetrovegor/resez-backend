import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { ApiError } from '../apiError';
import { RequestWithBody } from 'types/request';
import roleService from '../services/roleService';

class RoleController {
    // убрать в будущем
    async giveFullRoleToUser(req: RequestWithBody<{ nickname: string }>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            await roleService.giveFullRoleToUser(req.body.nickname);
            
            res.send(200);
        } catch (error) {
            next(error);
        }
    }
}

export default new RoleController();