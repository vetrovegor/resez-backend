import path from 'path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import 'dotenv/config';

import routes from './routes';
import authenticate from './authenticate';
import STATIC_PATH from './consts';

// const dbconnector = require('./db')

// fastify.register(dbconnector)

const fastify = Fastify({
    logger: {
        level: 'warn',
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        }
    },
    ajv: { plugins: [require('@fastify/multipart').ajvFilePlugin] }
});

fastify.register(cors, {
    credentials: true,
    origin: process.env.ALLOWED_ORIGINS.split(',')
});

fastify.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE_MB) * 1024 ** 2
    }
});

fastify.register(fastifyStatic, {
    root: STATIC_PATH,
    prefix: '/api/static/'
});

fastify.register(fastifySwagger, {
    mode: 'static',
    specification: {
        path: path.join(__dirname, '..', 'api.yaml'),
        baseDir: path.join(__dirname, '..'),
        postProcessor: function (swaggerObject) {
            return swaggerObject;
        }
    }
    // exposeRoute: true
});

fastify.register(fastifySwaggerUI, {
    routePrefix: '/api-docs',
    staticCSP: true,
    uiConfig: {
        deepLinking: false
    },
    uiHooks: {
        onRequest: function (request, reply, next) {
            next();
        },
        preHandler: function (request, reply, next) {
            next();
        }
    }
});

fastify.register(authenticate);

fastify.register(routes, { prefix: '/api' });

const PORT = Number(process.env.PORT) || 8080;

function start() {
    try {
        fastify.listen({ port: PORT, host: '0.0.0.0' }, () =>
            console.log(`Server started at port ${PORT}`)
        );
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();
