import Joi from 'joi';

export const unreadSchema = Joi.object({
    unread: Joi.boolean().messages({
        'boolean.base': 'Поле unread должен быть логическим значением.'
    })
});
