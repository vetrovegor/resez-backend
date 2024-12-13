import Joi from 'joi';

export const notificationFilterSchema = Joi.object({
    delayed: Joi.boolean().messages({
        'boolean.base': 'Поле delayed должен быть логическим значением.'
    }),
    sender_id: Joi.number().messages({
        'number.base': 'Поле sender_id должно быть числом.'
    })
});
