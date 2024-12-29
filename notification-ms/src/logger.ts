import winston from 'winston';

const { combine, timestamp, prettyPrint } = winston.format;

export default winston.createLogger({
    level: 'info',
    format: combine(timestamp(), prettyPrint()),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log', level: 'info' })
    ]
});
