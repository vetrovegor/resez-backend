import amqp from 'amqplib';

import userService from './userService';
import codeService from './codeService';
import sessionService from './sessionService';
import achievementService from './achievementService';

class RmqService {
    private channel: amqp.Channel;

    async init() {
        try {
            const connection = await amqp.connect(process.env.RMQ_URL);
            this.channel = await connection.createChannel();
            await this.consumeQueues();
            console.log('RabbitMQ started');
        } catch (error) {
            throw error;
        }
    }

    async consumeQueues() {
        await this.channel.assertExchange(process.env.RMQ_EXCHANGE, 'direct');

        const queues = [
            'get-verified-user-by-telegram-chat-id',
            'create-and-emit-auth-code',
            'validate-verify-code',
            'verify-user',
            'end-session',
            'user-queue'
        ];

        for (const queue of queues) {
            await this.channel.assertQueue(queue);
        }

        this.channel.consume(
            'get-verified-user-by-telegram-chat-id',
            async msg => {
                const { telegramChatId } = JSON.parse(msg.content.toString());

                const user = await userService.getVerifiedUserByTelegramChatId(
                    telegramChatId
                );

                this.channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(user))
                );
            },
            { noAck: true }
        );

        await this.channel.bindQueue(
            'create-and-emit-auth-code',
            process.env.RMQ_EXCHANGE,
            'auth-code'
        );

        this.channel.consume(
            'create-and-emit-auth-code',
            async msg => {
                const { userId, uniqueId } = JSON.parse(msg.content.toString());
                await codeService.createAndEmitAuthCode(userId, uniqueId);
            },
            { noAck: true }
        );

        this.channel.consume(
            'validate-verify-code',
            async msg => {
                const { code } = JSON.parse(msg.content.toString());

                const codeData = await codeService.validateVerifyCode(code);

                this.channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(codeData))
                );
            },
            { noAck: true }
        );

        await this.channel.bindQueue(
            'verify-user',
            process.env.RMQ_EXCHANGE,
            'verify'
        );

        this.channel.consume(
            'verify-user',
            async msg => {
                const { userId, telegramChatId, telegramUsername } = JSON.parse(
                    msg.content.toString()
                );
                await userService.verifyUser(
                    userId,
                    telegramChatId,
                    telegramUsername
                );
            },
            { noAck: true }
        );

        this.channel.consume(
            'user-queue',
            async msg => {
                const message = JSON.parse(msg.content.toString());
                let response = null;

                // довести до ума
                try {
                    if (message.pattern == 'preview') {
                        response = (
                            await userService.getUserById(message.data)
                        ).toPreview();
                    } else if (message.pattern == 'preview-by-nickname') {
                        response = (
                            await userService.getUserByNickname(message.data)
                        ).toPreview();
                    } else if (message.pattern == 'check-achievement') {
                        const { userId, achievementType, value } = message.data;

                        await achievementService.checkAchievementCompletion(
                            userId,
                            achievementType,
                            value
                        );
                    }
                } catch (error) {
                    console.log(
                        'Произошла ошибка при обработке сообщения RabbitMQ',
                        error
                    );
                }

                this.channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(response)),
                    { correlationId: msg.properties.correlationId }
                );
            },
            { noAck: true }
        );

        this.channel.consume(
            'end-session',
            async msg => {
                const { sessionId } = JSON.parse(msg.content.toString());
                await sessionService.endSessionById(sessionId);
            },
            { noAck: true }
        );
    }

    async publishMessage(routingKey: string, content: object) {
        // if (!this.channel) {
        //     await this.init();
        // }

        this.channel.publish(
            process.env.RMQ_EXCHANGE,
            routingKey,
            Buffer.from(JSON.stringify(content))
        );
    }

    async sendToQueue(queue: string, pattern: string, data?: any) {
        const { queue: replyTo } = await this.channel.assertQueue('', {
            exclusive: true
        });

        this.channel.sendToQueue(
            queue,
            Buffer.from(JSON.stringify({ pattern, data })),
            {
                replyTo
            }
        );

        return await new Promise(resolve => {
            setTimeout(() => {
                this.channel
                    .cancel(replyTo)
                    .catch(err =>
                        console.error('Error cancelling queue:', err)
                    );
                resolve(null);
            }, 1000);

            this.channel.consume(
                replyTo,
                msg => {
                    const data = JSON.parse(msg.content.toString());
                    resolve(data);
                },
                { noAck: true }
            );
        });
    }
}

export default new RmqService();
