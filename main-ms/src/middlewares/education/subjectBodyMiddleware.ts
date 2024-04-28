import { ValidationChain, body } from 'express-validator';

export const subjectBodyMiddleware: ValidationChain[] = [
    body('subject')
        .isString()
        .isLength({ max: 75 })
        .withMessage(
            'Предмет должен быть строкой с максимальной длиной 75 символов'
        ),
    body('slug')
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage(
            'Slug должен состоять только из прописных английских букв, цифр и дефисов (дефисы не могут идти подряд)'
        ),
    body('subjectTasks')
        .isArray({ min: 1 })
        .withMessage(
            'subjectTasks должен быть массивом с минимальной длиной 1'
        ),
    body('subjectTasks.*.theme')
        .isString()
        .isLength({ max: 75 })
        .withMessage(
            'Каждая тема в subjectTasks должна быть строкой с максимальной длиной 75 символов'
        ),
    body('subjectTasks.*.primaryScore')
        .isNumeric()
        .withMessage(
            'primaryScore в subjectTasks должен быть числовым значением'
        ),
    body('subjectTasks.*.isDetailedAnswer')
        .isBoolean()
        .withMessage(
            'isDetailedAnswer в subjectTasks должен быть логическим значением'
        ),
    body('subjectTasks.*.subThemes')
        .isArray({ min: 1 })
        .withMessage(
            'subThemes в subjectTasks должен быть массивом с минимальной длиной 1'
        ),
    body('subjectTasks.*.subThemes.*')
        .isObject()
        .withMessage(
            'Каждый элемент в subThemes в subjectTasks должен быть объектом'
        ),
    body('subjectTasks.*.subThemes.*.subTheme')
        .isString()
        .notEmpty()
        .isLength({ max: 75 })
        .withMessage(
            'Каждая подтема в subThemes в subjectTasks должна быть строкой с максимальной длиной 75 символов'
        ),
    body('durationMinutes')
        .isNumeric()
        .withMessage('Длительность в минутах должна быть числовым значением'),
    body('isMark')
        .isBoolean()
        .withMessage('Оценка должна быть логическим значением'),
    body('isPublished')
        .isBoolean()
        .withMessage('Опубликован должен быть логическим значением')
];
