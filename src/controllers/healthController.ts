import { Request, Response, NextFunction } from 'express';

class HealthController {
    async checkHealth(req: Request, res: Response, next: NextFunction) {
        res.send();
    }
}

export default new HealthController();