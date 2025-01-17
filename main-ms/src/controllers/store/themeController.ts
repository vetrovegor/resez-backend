import { Response, NextFunction } from 'express';

import themeService from '@services/store/themeService';
import {
    IdParam,
    PaginationQuery,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndUser,
    RequestWithQuery,
    RequestWithQueryAndUser
} from 'src/types/request';
import { ThemeDTO } from 'src/types/store';

class ThemeController {
    async createTheme(
        req: RequestWithBody<ThemeDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const theme = await themeService.createTheme(req.body);
            res.json({ theme });
        } catch (error) {
            next(error);
        }
    }

    async getThemes(
        req: RequestWithQuery<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = await themeService.getThemes(
                req.query.limit,
                req.query.offset
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async togglePublishTheme(
        req: RequestWithParams<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const theme = await themeService.togglePublishTheme(req.params.id);

            res.json({ theme });
        } catch (error) {
            next(error);
        }
    }

    async updateTheme(
        req: RequestWithParamsAndBody<IdParam, ThemeDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const theme = await themeService.updateTheme(
                req.params.id,
                req.body
            );

            res.json({ theme });
        } catch (error) {
            next(error);
        }
    }

    async getPublishedThemes(
        req: RequestWithQueryAndUser<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = await themeService.getPublishedThemes(
                req.query.limit,
                req.query.offset,
                req.user.id
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async addThemeToUser(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const theme = await themeService.addThemeToUser(
                req.params.id,
                req.user.id
            );

            res.json({ theme });
        } catch (error) {
            next(error);
        }
    }

    async getThemeDtoById(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const product = await themeService.getThemeDtoById(
                req.params.id,
                req.user.id
            );

            res.json({ product });
        } catch (error) {
            next(error);
        }
    }

    async getUserThemes(
        req: RequestWithQueryAndUser<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = await themeService.getUserThemes(
                req.user.id,
                req.query.limit,
                req.query.offset
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async deleteTheme(
        req: RequestWithParams<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            await themeService.deleteTheme(req.params.id);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
}

export default new ThemeController();
