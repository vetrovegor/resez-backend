import { Response, NextFunction } from 'express';

import { PaginationQuery, RequestWithBodyAndUser, RequestWithParamsAndBodyAndUser, RequestWithParamsAndUser, RequestWithQueryAndUser, IdParam, RequestWithUser } from 'types/request';
import { CollectionBodyDTO, CollectionSettings } from 'types/collection';
import collectionService from '../services/memory/collectionService';
import userService from '../services/userService';

class CollectionController {
    async createCollection(req: RequestWithBodyAndUser<CollectionBodyDTO>, res: Response, next: NextFunction) {
        try {
            const { collection, description, isPrivate, QAPairs } = req.body;

            const createdCollection = await collectionService.createCollection(req.user.id, collection, description, isPrivate, QAPairs);

            res.json({ collection: createdCollection });
        } catch (error) {
            next(error);
        }
    }

    async getUserCollections(req: RequestWithQueryAndUser<PaginationQuery>, res: Response, next: NextFunction) {
        try {
            const { limit, offset } = req.query;

            const data = await collectionService.getUserCollections(req.user.id, limit, offset);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async getCollectionById(req: RequestWithParamsAndUser<IdParam>, res: Response, next: NextFunction) {
        try {
            const collection = await collectionService.getCollectionById(req.params.id, req.user.id);

            res.json({ collection });
        } catch (error) {
            next(error);
        }
    }

    async deleteCollectionById(req: RequestWithParamsAndUser<IdParam>, res: Response, next: NextFunction) {
        try {
            const collection = await collectionService.deleteCollectionById(req.params.id, req.user.id);

            res.json({ collection });
        } catch (error) {
            next(error);
        }
    }

    async updateCollection(req: RequestWithParamsAndBodyAndUser<IdParam, CollectionBodyDTO>, res: Response, next: NextFunction) {
        try {
            const { collection, description, isPrivate, QAPairs } = req.body;

            const updatedCollection = await collectionService.updateCollection(req.params.id, req.user.id, collection, description, isPrivate, QAPairs);

            res.json({ collection: updatedCollection });
        } catch (error) {
            next(error);
        }
    }

    async getCardsByCollectionId(req: RequestWithParamsAndUser<IdParam>, res: Response, next: NextFunction) {
        try {
            const cards = await collectionService.getCardsByCollectionId(req.params.id, req.user.id);

            res.json({ cards });
        } catch (error) {
            next(error);
        }
    }

    async getUserCollectionSettings(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const settings = await userService.getUserCollectionSettings(req.user.id);

            res.json({ settings });
        } catch (error) {
            next(error);
        }
    }

    async updateCollectionSettings(req: RequestWithBodyAndUser<CollectionSettings>, res: Response, next: NextFunction) {
        try {
            const { isShuffleCards, isDefinitionCardFront } = req.body;

            const settings = await userService.updateCollectionSettings(
                req.user.id,
                isShuffleCards,
                isDefinitionCardFront
            );

            res.json({ settings });
        } catch (error) {
            next(error);
        }
    }
}

export default new CollectionController();