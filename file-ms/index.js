const fastify = require('fastify')({
    logger: true,
    ajv: { plugins: [require('@fastify/multipart').ajvFilePlugin] }
});
require('dotenv').config();

const routes = require('./routes');
const authenticate = require('./authenticate');
const STATIC_PATH = require('./consts');

// const route  = require('./routes')
// const dbconnector = require('./db')

// fastify.register(dbconnector)

// fastify.register(require('@fastify/jwt'), {
//     secret: process.env.JWT_ACCESS_SECRET
// });

fastify.register(require('@fastify/multipart'), {
    attachFieldsToBody: true
});

fastify.register(require('@fastify/static'), {
    root: STATIC_PATH,
    prefix: '/api/static/'
});

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
