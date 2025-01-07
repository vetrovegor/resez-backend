import { Response, NextFunction } from 'express';

import liveKitService from '@services/liveKitService';
import { RequestWithQuery } from 'src/types/request';

class LiveKitController {
    async getToken(
        req: RequestWithQuery<{ room: string; username: string }>,
        res: Response,
        next: NextFunction
    ) {
        const token = await liveKitService.getToken(
            req.query.room,
            req.query.username
        );

        res.json({ token });
    }
}

export default new LiveKitController();
