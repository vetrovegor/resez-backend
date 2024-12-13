import amqp from 'amqplib';

import config from '../config';

let connection: amqp.Connection;
let channel: amqp.Channel;

export const connectRabbitMQ  = async () => {
    try {
        connection = await amqp.connect(config.rmqUrl);
        channel = await connection.createChannel();
        return { connection, channel };
    } catch (error) {
        console.error('Ошибка подключения к RabbitMQ:', error);
        throw error;
    }
};

export const sendToQueue = async (
    queue: string,
    pattern: string,
    data?: any
) => {
    if (!connection || !channel) {
        await connectRabbitMQ ();
    }

    const { queue: replyTo } = await channel.assertQueue('', {
        exclusive: true
    });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify({ pattern, data })), {
        replyTo
    });

    return await new Promise(resolve => {
        setTimeout(() => {
            channel
                .cancel(replyTo)
                .catch(err => console.error('Error cancelling queue:', err));
            resolve(null);
        }, 1000);

        channel.consume(
            replyTo,
            msg => {
                if (msg) {
                    const data = JSON.parse(msg.content.toString());
                    resolve(data);
                }
            },
            { noAck: true }
        );
    });
};
