import { Request, Response, NextFunction } from 'express';
import avatarDecorationService from '../../services/store/avatarDecorationService';
import {
    PaginationQuery,
    RequestWithBody,
    RequestWithQuery
} from 'types/request';
import { AvatarDecorationDTO } from 'types/store';
import { UploadedFile } from 'express-fileupload';

class AvatarDecorationController {
    async createAvatarDecoration(
        req: RequestWithBody<AvatarDecorationDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const {
                title,
                contentType,
                price,
                seasonStartDate,
                seasonEndDate,
                achievementId,
                options
            } = req.body;
            const { content } = req.files;

            const product =
                await avatarDecorationService.createAvatarDecoration(
                    title,
                    contentType,
                    price,
                    seasonStartDate,
                    seasonEndDate,
                    achievementId,
                    options,
                    content as UploadedFile
                );

            res.json({ product });
        } catch (error) {
            next(error);
        }
    }

    async getAvatarDecorations(
        req: RequestWithQuery<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        const { limit, offset } = req.query;

        const data = await avatarDecorationService.getAvatarDecorations(limit, offset);

        res.json(data);
    }
}

export default new AvatarDecorationController();
