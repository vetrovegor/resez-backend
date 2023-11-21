import { Request, Response, NextFunction } from 'express';

class HealthController {
    async checkHealth(req: Request, res: Response, next: NextFunction) {
        res.send(200);
    }
}

export default new HealthController();