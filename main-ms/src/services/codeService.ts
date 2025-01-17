import { Op } from 'sequelize';

import Code from '@db/models/Code';
import { VerificationCodeData } from 'src/types/code';
import userService from './userService';
import { ApiError } from '@ApiError';
import User from '@db/models/User';
import { EmitTypes } from '@enums/socket';
import rmqService from './rmqService';
import { Queues } from '@enums/rmq';

// подумать как сделать лучше, как вынести в файл с типами
export const enum CodeTypes {
    VERIFY = 'VERIFY',
    RECOVERY = 'RECOVERY',
    CHANGE = 'CHANGE',
    AUTH = 'AUTH'
}

class CodeService {
    async createVerificationCode(
        userId: number
    ): Promise<VerificationCodeData> {
        const code = this.generateCode();
        const currentDate = Date.now();
        const retryDate = currentDate + 60000;
        const lifetime =
            Number(process.env.VERIFICATION_CODE_EXPIRATION) * 1000;
        const expiredDate = currentDate + lifetime;
        const verificationCodeData = { code, lifetime };

        const codeData = await Code.findOne({
            where: {
                userId,
                type: CodeTypes.VERIFY,
                expiredDate: {
                    [Op.gt]: new Date(currentDate)
                }
            }
        });

        if (codeData) {
            await codeData.update({
                code,
                expiredDate,
                retryDate
            });

            rmqService.sendToQueue(Queues.Socket, 'emit-to-user', {
                userId,
                emitType: EmitTypes.VerifyCodeUpdated,
                data: { verificationCodeData }
            });

            return verificationCodeData;
        }

        await Code.create({
            code,
            expiredDate,
            retryDate,
            userId,
            type: CodeTypes.VERIFY
        });

        return verificationCodeData;
    }

    generateCode(): string {
        const code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

        return code.toString();
    }

    async validateCode(
        type: CodeTypes,
        code?: string,
        userId?: number
    ): Promise<Code> {
        const whereOptions: any = {
            type,
            expiredDate: {
                [Op.gt]: Date.now()
            }
        };

        if (code) {
            whereOptions.code = code;
        }

        if (userId) {
            whereOptions.userId = userId;
        }

        return await Code.findOne({
            where: whereOptions
        });
    }

    async validateVerifyCode(code: string): Promise<Code> {
        return await this.validateCode(CodeTypes.VERIFY, code, null);
    }

    async sendRecoveryPasswordCode(nickname: string): Promise<Code> {
        const user = await userService.getUserByNickname(nickname);

        if (!user) {
            return;
        }

        const { id, telegramChatId } = user.toJSON();

        if (!telegramChatId) {
            return;
        }

        return await this.saveCode(
            id,
            telegramChatId,
            CodeTypes.RECOVERY,
            'Код для восстановления пароля:',
            60000,
            300000
        );
    }

    async verifyRecoveryPasswordCode(
        nickname: string,
        code: string
    ): Promise<void> {
        const user = await userService.getUserByNickname(nickname);

        if (!user) {
            this.throwInvalidCode();
        }

        const codeData = await this.validateCode(
            CodeTypes.RECOVERY,
            code,
            user.id
        );

        if (!codeData) {
            this.throwInvalidCode();
        }

        return;
    }

    async sendChangePasswordCode(
        userId: number,
        oldPassword: string
    ): Promise<Code> {
        await userService.validateUserPassword(userId, oldPassword);

        const telegramChatId = await userService.getUserTelegramChatId(userId);

        return await this.saveCode(
            userId,
            telegramChatId,
            CodeTypes.CHANGE,
            'Код для смены пароля:',
            60000,
            300000
        );
    }

    async verifyChangePasswordCode(
        userId: number,
        code: string
    ): Promise<void> {
        const codeData = await this.validateCode(
            CodeTypes.CHANGE,
            code,
            userId
        );

        if (!codeData) {
            this.throwInvalidCode();
        }

        return;
    }

    async createAndEmitAuthCode(
        userId: number,
        uniqueId: string
    ): Promise<void> {
        const createdCode = await this.saveCode(
            userId,
            null,
            CodeTypes.AUTH,
            null,
            0,
            5000,
            false
        );

        rmqService.sendToQueue(Queues.Socket, 'emit-auth-code', {
            uniqueId,
            code: createdCode.get('code')
        });
    }

    // сделать как-то чтобы не зависило от пользователя
    async verifyAuthCode(code: string): Promise<User> {
        const codeData = await this.validateCode(CodeTypes.AUTH, code);

        if (!codeData) {
            this.throwInvalidCode();
        }

        const user = await userService.getUserById(codeData.get('userId'));

        await Code.destroy({
            where: {
                id: codeData.id
            }
        });

        return user;
    }

    async saveCode(
        userId: number,
        telegramChatId: string,
        type: CodeTypes,
        message: string,
        cooldown: number = 60000,
        lifetime: number = 60000,
        shouldSendMessage: boolean = true
    ): Promise<Code> {
        const codeData = await this.validateCode(type, null, userId);

        const code = this.generateCode();
        const currentDate = Date.now();
        const retryDate = currentDate + cooldown;
        const expiredDate = currentDate + lifetime;

        if (!codeData) {
            if (shouldSendMessage) {
                await rmqService.publishMessage('code', {
                    telegramChatId,
                    message,
                    code
                });
            }

            return await Code.create({
                code,
                expiredDate,
                retryDate,
                userId,
                type
            });
        }

        if (Number(codeData.get('retryDate')) > currentDate) {
            throw ApiError.badRequest('Код уже выслан');
        }

        if (shouldSendMessage) {
            await rmqService.publishMessage('code', {
                telegramChatId,
                message,
                code
            });
        }

        return await codeData.update({
            code,
            expiredDate,
            retryDate
        });
    }

    throwInvalidCode() {
        throw ApiError.badRequest('Некорректный код');
    }
}

export default new CodeService();
