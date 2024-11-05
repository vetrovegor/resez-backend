import { MultipartFile } from '@fastify/multipart';
import { FastifyReply, FastifyRequest } from 'fastify';

import { JwtPayload } from './types/interfaces';
import { ApiError } from './ApiError';
import { Subscriptions } from './types/enums';

export const validateFileSize = async (
    request: FastifyRequest<{ Body: { file: MultipartFile } }>,
    reply: FastifyReply
) => {
    const user = request.user as JwtPayload;
    const { subscription, permissions } = user;

    const isAdmin = permissions.length > 0;

    const { bytesRead } = request.body.file.file;

    if (!subscription && !isAdmin) {
        throw ApiError.forbidden();
    }

    if (
        bytesRead > 1 * 1024 ** 2 &&
        subscription.subscription == Subscriptions.Premium &&
        !isAdmin
    ) {
        throw ApiError.requestEntityTooLarge(
            'Вы можете загружать файлы не более 1 MB'
        );
    }

    // TODO: добавить проверку что у пользователя нет пермишина загрузки больших файлов
    if (bytesRead > 5 * 1024 ** 2) {
        throw ApiError.requestEntityTooLarge(
            'Вы можете загружать файлы не более 5 MB'
        );
    }
};
