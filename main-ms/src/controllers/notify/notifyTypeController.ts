import { Request, Response, NextFunction } from 'express';

import notifyTypeService from '../../services/notifies/notifyTypeService';

class NotifyTypeController {
    async getNotifyTypes(req: Request, res: Response, next: NextFunction) {
        try {
            const types = await notifyTypeService.getNotifyTypes();

            res.json({ types });
        } catch (error) {
            next(error);
        }
    }
}

export default new NotifyTypeController();