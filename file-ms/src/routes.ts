import { MultipartFile } from '@fastify/multipart';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { saveFile } from './file-service';
import { validateFileSize } from './validate-file-size';

// const { allTodos, addTodo, updateTodo, deleteTodo } = require('./schemas');

// TODO: разобраться почему если вынести это в отельный файл, то TS не видит это
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>;
    }
}

export default (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    // const client = fastify.db.client;

    fastify.post<{ Body: { file: MultipartFile } }>(
        '/upload',
        {
            onRequest: [fastify.authenticate],
            // TODO: разобраться почему если вынести это в отельный файл, то не работает
            schema: {
                body: {
                    type: 'object',
                    required: ['file'],
                    properties: {
                        file: { isFile: true }
                    }
                }
            },
            preHandler: validateFileSize,
        },
        async (request, reply) => {
            try {
                const path = await saveFile('', request.body.file);

                // console.log({ user: request.user });

                // сохранение в бд

                // await pipeline(data.file, fs.createWriteStream(data.filename))

                // const { rows } = await client.query('SELECT * FROM files');
                // return rows;

                return {
                    success: 1,
                    file: { url: `${process.env.STATIC_URL}${path}` }
                };
            } catch (err) {
                throw new Error(err);
            }
        }
    );
};
