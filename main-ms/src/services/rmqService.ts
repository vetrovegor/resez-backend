import amqp from 'amqplib';

import userService from './userService';
import codeService from './codeService';
import sessionService from './sessionService';

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
                const { userId, telegramChatId } = JSON.parse(
                    msg.content.toString()
                );
                await userService.verifyUser(userId, telegramChatId);
            },
            { noAck: true }
        );

        this.channel.consume(
            'user-queue',
            async msg => {
                const message = JSON.parse(msg.content.toString());
                let response = null;

                if (message.pattern == 'preview') {
                    response = (
                        await userService.getUserById(message.data)
                    ).toPreview();
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

    sendToQueue(queue: string, pattern: string, data: any) {
        this.channel.sendToQueue(
            queue,
            Buffer.from(JSON.stringify({ pattern, data }))
        );
    }
}

export default new RmqService();
