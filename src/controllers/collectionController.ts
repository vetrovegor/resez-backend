import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { ApiError } from '../apiError';
import { PaginationParams, RequestWithBodyAndUser, RequestWithParamsAndBodyAndUser, RequestWithParamsAndUser, RequestWithQueryAndUser, WithId } from 'types/request';
import { CollectionBodyDTO } from 'types/collection';
import collectionService from '../services/collectionService';

class CollectionController {
    async createCollection(req: RequestWithBodyAndUser<CollectionBodyDTO>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            const { collection, description, isPrivate, QAPairs } = req.body;

            const createdCollection = await collectionService.createCollection(req.user.id, collection, description, isPrivate, QAPairs);

            res.json({ collection: createdCollection });
        } catch (error) {
            next(error);
        }
    }

    async getUserCollections(req: RequestWithQueryAndUser<PaginationParams>, res: Response, next: NextFunction) {
        try {
            const { limit, offset } = req.query;

            const data = await collectionService.getUserCollections(req.user.id, limit, offset);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async getCollectionById(req: RequestWithParamsAndUser<WithId>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            const collection = await collectionService.getCollectionById(req.params.id, req.user.id);

            res.json({ collection });
        } catch (error) {
            next(error);
        }
    }

    async deleteCollectionById(req: RequestWithParamsAndUser<WithId>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            const collection = await collectionService.deleteCollectionById(req.params.id, req.user.id);

            res.json({ collection });
        } catch (error) {
            next(error);
        }
    }

    async updateCollectionById(req: RequestWithParamsAndBodyAndUser<WithId, CollectionBodyDTO>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            const { collection, description, isPrivate, QAPairs } = req.body;

            const updatedCollection = await collectionService.updateCollectionById(req.params.id, req.user.id, collection, description, isPrivate, QAPairs);

            res.json({ collection: updatedCollection });
        } catch (error) {
            next(error);
        }
    }
}

export default new CollectionController();