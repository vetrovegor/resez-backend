const fastify = require('fastify')({ logger: true });
const fm = require('@fastify/multipart')
require('dotenv').config();

const routes = require('./routes');
const authenticate = require('./authenticate');

// const route  = require('./routes')
// const dbconnector = require('./db')

// fastify.register(dbconnector)

// fastify.register(require('@fastify/jwt'), {
//     secret: process.env.JWT_ACCESS_SECRET
// });

fastify.register(fm);
fastify.register(authenticate);

// fastify.addHook('onRequest', async (request, reply) => {
//     try {
//         await request.jwtVerify();
//     } catch (err) {
//         reply.send(err);
//     }
// });

fastify.register(routes, { prefix: '/api' });

const PORT = process.env.PORT || 8080;

async function start() {
    try {
        await fastify.listen({ port: PORT }, () =>
            console.log(`Server started at port ${PORT}`)
        );
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();
