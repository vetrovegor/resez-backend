import { ValidationChain, body } from 'express-validator';

export const roleBodyMiddleware: ValidationChain[] = [
    body('role')
        .isLength({ min: 1, max: 30 })
        .withMessage('Длина роли должна быть от 1 до 30 символов'),
    body('permissions')
        .isArray({ min: 1 })
        .withMessage(
            'Поле permissions должно быть массивом с минимум одним элементом'
        ),
    body('textColor').isHexColor().withMessage('Некорректный цвет текста'),
    body('backgroundColor').isHexColor().withMessage('Некорректный цвет фона')
];
