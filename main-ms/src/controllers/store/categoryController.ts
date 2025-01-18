import { Response, NextFunction } from 'express';

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
import { CategoryDTO } from 'src/types/store';
import categoryService from '@services/store/categoryService';

class CategoryController {
    async createCategory(
        req: RequestWithBody<CategoryDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const category = await categoryService.createCategory(req.body);

            res.json({ category });
        } catch (error) {
            next(error);
        }
    }

    async getCategoriesForAdmin(
        req: RequestWithQuery<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = await categoryService.getCategoriesForAdmin(
                req.query.limit,
                req.query.offset
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async getCategoryInfo(
        req: RequestWithParams<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const category = await categoryService.getCategoryInfo(
                req.params.id
            );

            res.json({ category });
        } catch (error) {
            next(error);
        }
    }

    async updateCategory(
        req: RequestWithParamsAndBody<IdParam, CategoryDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const category = await categoryService.updateCategory(
                req.params.id,
                req.body
            );

            res.json({ category });
        } catch (error) {
            next(error);
        }
    }

    async deleteCategory(
        req: RequestWithParams<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const category = await categoryService.deleteCategory(
                req.params.id
            );

            res.json({ category });
        } catch (error) {
            next(error);
        }
    }

    async getCategoriesForUser(
        req: RequestWithQuery<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = await categoryService.getCategoriesForUser(
                req.query.limit,
                req.query.offset
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async getCategoriesProductsBySlug(
        req: RequestWithParams<{ slug: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const category = await categoryService.getCategoriesProductsBySlug(
                req.params.slug
            );

            res.json({ category });
        } catch (error) {
            next(error);
        }
    }
}

export default new CategoryController();
