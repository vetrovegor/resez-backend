import * as redis from 'redis';

export const redisClient = redis.createClient({ url: process.env.REDIS_URL }).on(
    'error',
    err => console.log('Redis Client Error', err)
);
