import { MultipartFile } from '@fastify/multipart';
import { FastifyReply, FastifyRequest } from 'fastify';

import { JwtPayload } from './types/interfaces';
import { ApiError } from './ApiError';
import { Permissions, Subscriptions } from './types/enums';

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
        (!subscription || subscription.subscription == Subscriptions.Premium) &&
        !isAdmin
    ) {
        throw ApiError.requestEntityTooLarge(
            'Вы можете загружать файлы не более 1 MB'
        );
    }

    if (
        bytesRead > 5 * 1024 ** 2 &&
        !user.permissions.some(
            permission => permission.permission == Permissions.UploadBigFiles
        )
    ) {
        throw ApiError.requestEntityTooLarge(
            'Вы можете загружать файлы не более 5 MB'
        );
    }
};
