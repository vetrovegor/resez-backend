import { Router } from "express";
import { body, param } from "express-validator";

import collectionController from "../controllers/collectionController";
import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";
import { paginationMiddleware } from "../middlewares/paginationMiddleware";

export const collectionRouter = Router();

collectionRouter.post(
    '/',
    // вынести это в отдельный мидлвейр чтобы использовать для редактирования
    body('collection').isString().isLength({ max: 75 }),
    body('description').isString().optional().isLength({ max: 500 }),
    body('isPrivate').isBoolean(),
    body('QAPairs').isArray({ min: 2 }),
    body('QAPairs.*.question').isString().isLength({ max: 250 }),
    body('QAPairs.*.answer').isString().isLength({ max: 250 }),
    accessTokenMiddleware,
    collectionController.createCollection
);

collectionRouter.get(
    '/',
    paginationMiddleware,
    accessTokenMiddleware,
    collectionController.getUserCollections
);

collectionRouter.get(
    '/:id',
    param('id').isNumeric(),
    accessTokenMiddleware,
    collectionController.getCollectionById
);

collectionRouter.delete(
    '/:id',
    param('id').isNumeric(),
    accessTokenMiddleware,
    collectionController.deleteCollectionById
);

collectionRouter.patch(
    '/:id',
    param('id').isNumeric(),
    // вынести это в отдельный мидлвейр чтобы использовать для редактирования
    body('collection').isString().isLength({ max: 75 }),
    body('description').isString().optional().isLength({ max: 500 }),
    body('isPrivate').isBoolean(),
    body('QAPairs').isArray({ min: 2 }),
    body('QAPairs.*.question').isString().isLength({ max: 250 }),
    body('QAPairs.*.answer').isString().isLength({ max: 250 }),
    accessTokenMiddleware,
    collectionController.updateCollectionById
);