import { Router } from "express";
import { body, param } from "express-validator";

import collectionController from "../controllers/collectionController";
import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";
import { paginationMiddleware } from "../middlewares/paginationMiddleware";
import { blockedMiddleware } from "../middlewares/blockedMiddleware";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { collectionBodyMiddleware } from "../middlewares/collectionBodyMiddleware";

export const collectionRouter = Router();

collectionRouter.post(
    '/',
    collectionBodyMiddleware,
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    collectionController.createCollection
);

collectionRouter.get(
    '/',
    paginationMiddleware,
    // подумать как исправить
    accessTokenMiddleware,
    blockedMiddleware,
    collectionController.getUserCollections
);

collectionRouter.get(
    '/settings',
    accessTokenMiddleware,
    blockedMiddleware,
    collectionController.getUserCollectionSettings
);

collectionRouter.get(
    '/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    collectionController.getCollectionById
);

collectionRouter.delete(
    '/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    collectionController.deleteCollectionById
);

collectionRouter.patch(
    '/settings',
    body('isShuffleCards').isBoolean().optional(),
    body('isDefinitionCardFront').isBoolean().optional(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    collectionController.updateCollectionSettings
);

collectionRouter.patch(
    '/:id',
    param('id').isNumeric(),
    collectionBodyMiddleware,
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    collectionController.updateCollection
);

collectionRouter.get(
    '/:id/cards',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    collectionController.getCardsByCollectionId
);