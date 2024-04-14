import 'dotenv/config';

export const CORS_OPTIONS = {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    // methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], // локально без этого работает
    credentials: true
}