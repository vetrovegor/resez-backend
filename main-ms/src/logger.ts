import winston from 'winston';

const { combine, timestamp, json, prettyPrint } = winston.format;

export default winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        json(),
        prettyPrint()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
