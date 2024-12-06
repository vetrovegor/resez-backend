import { Type } from '@prisma/client';
import Joi from 'joi';

export const notificationSchema = Joi.object({
    type: Joi.string()
        .valid(...Object.values(Type))
        .required()
        .messages({
            'string.base': 'Поле type должно быть строкой.',
            'string.empty': 'Поле type не может быть пустым.',
            'any.required': 'Поле type обязательно для заполнения.',
            'any.only': `Поле type должно иметь одно из следующих значений: ${Object.values(
                Type
            ).toString()}.`
        }),
    title: Joi.string().max(100).required().messages({
        'string.base': 'Поле title должно быть строкой.',
        'string.empty': 'Поле title не может быть пустым.',
        'any.required': 'Поле title обязательно для заполнения.',
        'string.max': 'Поле title не должно превышать 100 символов.'
    }),
    content: Joi.string().required().messages({
        'string.base': 'Поле content должно быть строкой.',
        'string.empty': 'Поле content не может быть пустым.',
        'any.required': 'Поле content обязательно для заполнения.'
    }),
    author: Joi.string().messages({
        'string.base': 'Поле author должно быть строкой.',
        'string.empty': 'Поле author не может быть пустым.'
    }),
    date: Joi.string().isoDate().messages({
        'string.isoDate':
            'Поле date должно быть в формате ISO 8601 (например, 2024-08-08T22:55:00.000+05:00)..',
        'string.empty': 'Поле date не может быть пустым.'
    }),
    userIds: Joi.array()
        .items(
            Joi.number().messages({
                'number.base': 'Элементы userIds должны быть числами.'
            })
        )
        .required()
        .messages({
            'array.base': 'Поле userIds должно быть массивом.',
            'any.required': 'Поле userIds обязательно для заполнения.'
        })
});
