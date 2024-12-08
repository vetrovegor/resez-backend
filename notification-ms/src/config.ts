import 'dotenv/config';
import joi, { any } from 'joi';

const envVarsSchema = joi
    .object()
    .keys({
        PORT: joi.number().positive().required(),
        ALLOWED_ORIGINS: joi
            .custom((value, helpers) => {
                const items = value.split(',');

                const invalidItems = items.filter(
                    (item: any) => joi.string().uri().validate(item).error
                );

                if (invalidItems.length > 0) {
                    return helpers.error('any.invalid');
                }

                return items;
            })
            .required(),
        RMQ_URL: joi.string().uri().required(),
        JWT_ACCESS_SECRET: joi.string().required()
    })
    .unknown();

const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export default {
    port: envVars.PORT,
    allowedOrigins: envVars.ALLOWED_ORIGINS,
    rmqUrl: envVars.RMQ_URL,
    jwtAccessSecret: envVars.JWT_ACCESS_SECRET
};
