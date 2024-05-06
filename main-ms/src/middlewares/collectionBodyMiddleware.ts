import { ValidationChain, body } from "express-validator";

export const collectionBodyMiddleware: ValidationChain[] = [
    body('collection').isString().isLength({ max: 75 })
        .withMessage('Коллекция должна быть строкой с максимальной длиной 75 символов'),
    body('description').isString().optional().isLength({ max: 500 })
        .withMessage('Описание должно быть строкой с максимальной длиной 500 символов'),
    body('isPrivate').isBoolean()
        .withMessage('isPrivate должно быть логическим значением'),
    body('QAPairs.*.question').isString().isLength({ max: 250 })
        .withMessage('Каждый вопрос в QAPairs должен быть строкой с максимальной длиной 250 символов'),
    body('QAPairs.*.answer').isString().isLength({ max: 250 })
        .withMessage('Каждый ответ в QAPairs должен быть строкой с максимальной длиной 250 символов'),
];