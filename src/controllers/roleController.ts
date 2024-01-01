import { Response, NextFunction } from 'express';

import { RequestWithBody } from 'types/request';
import roleService from '../services/roleService';

class RoleController {
    // убрать в будущем
    async giveFullRoleToUser(req: RequestWithBody<{ nickname: string }>, res: Response, next: NextFunction) {
        try {
            await roleService.giveFullRoleToUser(req.body.nickname);
            
            res.send(200);
        } catch (error) {
            next(error);
        }
    }
}

export default new RoleController();