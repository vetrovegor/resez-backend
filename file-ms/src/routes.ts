import { MultipartFile } from '@fastify/multipart';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { saveFile, uploadImageByUrl } from './file-service';
import { validateFileSize } from './validate-file-size';
import { FileDto } from './FileDto';

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
            // TODO: разобраться почему если вынести cхему в отельный файл, то не работает
            schema: {
                body: {
                    type: 'object',
                    required: ['file'],
                    properties: {
                        file: { isFile: true }
                    }
                }
            },
            preHandler: validateFileSize
        },
        async (request, reply) => {
            try {
                const path = await saveFile('', request.body.file);

                return new FileDto(`${process.env.STATIC_URL}${path}`);
            } catch (err) {
                throw new Error(err);
            }
        }
    );

    fastify.post<{ Body: { url: string } }>(
        '/upload/image-by-url',
        {
            onRequest: [fastify.authenticate],
            // TODO: разобраться почему если вынести cхему в отельный файл, то не работает
            schema: {
                body: {
                    type: 'object',
                    required: ['url'],
                    properties: {
                        url: { type: 'string' }
                    }
                }
            }
        },
        async (request, reply) => {
            try {
                const path = await uploadImageByUrl(request.body.url);

                return new FileDto(`${process.env.STATIC_URL}${path}`);
            } catch (err) {
                throw new Error(err);
            }
        }
    );
};
