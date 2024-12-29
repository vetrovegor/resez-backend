import { Request, Response, NextFunction } from 'express';
import avatarDecorationService from '../../services/store/avatarDecorationService';
import {
    IdParam,
    PaginationQuery,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndUser,
    RequestWithQuery,
    RequestWithQueryAndUser
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
                requiredSubscriptionId,
                requiredAchievementId,
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
                    requiredSubscriptionId,
                    requiredAchievementId,
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
        try {
            const { limit, offset } = req.query;

            const data = await avatarDecorationService.getAvatarDecorations(
                limit,
                offset
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async togglePublishAvatarDecoration(
        req: RequestWithParams<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const product =
                await avatarDecorationService.togglePublishAvatarDecoration(
                    req.params.id
                );

            res.json({ product });
        } catch (error) {
            next(error);
        }
    }

    async getPublishedAvatarDecorations(
        req: RequestWithQueryAndUser<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { limit, offset } = req.query;

            const data =
                await avatarDecorationService.getPublishedAvatarDecorations(
                    limit,
                    offset,
                    req.user.id
                );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async addAvatarDecorationToUser(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const product =
                await avatarDecorationService.addAvatarDecorationToUser(
                    req.params.id,
                    req.user.id
                );

            res.json({ product });
        } catch (error) {
            next(error);
        }
    }

    async getAvatarDecorationDtoById(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const product =
                await avatarDecorationService.getAvatarDecorationDtoById(
                    req.params.id,
                    req.user.id
                );

            res.json({ product });
        } catch (error) {
            next(error);
        }
    }

    async getUserAvatarDecorations(
        req: RequestWithQueryAndUser<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { limit, offset } = req.query;

            const data = await avatarDecorationService.getUserAvatarDecorations(
                req.user.id,
                limit,
                offset
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async deleteAvatarDecoration(
        req: RequestWithParams<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            await avatarDecorationService.deleteAvatarDecoration(req.params.id);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
}

export default new AvatarDecorationController();
