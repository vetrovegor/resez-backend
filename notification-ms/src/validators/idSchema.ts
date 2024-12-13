import Joi from 'joi';

export const idSchema = Joi.object({
    id: Joi.number().required().messages({
        'number.base': 'Поле id должно быть числом.'
    })
});
