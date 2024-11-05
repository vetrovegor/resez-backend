import {
    FastifyInstance,
    FastifyPluginOptions,
    FastifyReply,
    FastifyRequest
} from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { ApiError } from './ApiError';

export default fp(async function (
    fastify: FastifyInstance,
    opts: FastifyPluginOptions
) {
    fastify.register(fastifyJwt, {
        secret: process.env.JWT_ACCESS_SECRET
    });

    fastify.decorate(
        'authenticate',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                throw ApiError.unauthorizedError();
            }
        }
    );
});
