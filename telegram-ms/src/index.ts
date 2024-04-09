import { Context, Telegraf } from "telegraf";
import { Message } from "telegraf/types";
import 'dotenv/config';
import amqp from 'amqplib';
import { v4, validate, version } from "uuid";

let channel: amqp.Channel;

const connect = async () => {
    try {
        const connection = await amqp.connect(process.env.RMQ_URL);
        channel = await connection.createChannel();
        await consumeQueues();
        console.log('RabbitMQ started');
    } catch (error) {
        console.log(`RabbitMQ error:`);
        throw error;
    }
}

const consumeQueues = async () => {
    await channel.assertExchange(process.env.RMQ_EXCHANGE, 'direct');

    const queues = [
        'send-code'
    ];

    for (const queue of queues) {
        await channel.assertQueue(queue)
    }

    await channel.bindQueue(
        'send-code',
        process.env.RMQ_EXCHANGE,
        'code'
    );

    channel.consume('send-code', async msg => {
        const { telegramChatId, message, code } = JSON.parse(msg.content.toString());
        await sendCode(telegramChatId, message, code);
    }, { noAck: true });
}

connect();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(ctx => handleStart(ctx));
// bot.command('me', ctx => handleMe(ctx));

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const sendInfoMessage = async (telegramChatId: string): Promise<Message.TextMessage> => {
    return bot.telegram.sendMessage(telegramChatId, 'Добро пожаловать!');
}

// подумать как исправить
type ContextWithStartPayload = Context & {
    startPayload: string
}

const handleStart = async (ctx: ContextWithStartPayload): Promise<Message.TextMessage> => {
    const startPayload = ctx.startPayload;
    const telegramChatId = ctx.message.chat.id.toString();

    if (!startPayload) {
        return await sendInfoMessage(telegramChatId);
    }

    const existedVerifiedUser = await getVerifiedUserByTelegramChatId(telegramChatId);

    if (validate(startPayload) && version(startPayload) == 4) {
        if (!existedVerifiedUser) {
            return bot.telegram.sendMessage(
                telegramChatId,
                'Ваш телеграм не привязан ни к одному аккаунту ReseEz. Пожалуйста, сначала зарегестрируйтесь. resez.ru/register'
            );
        }

        channel.publish(
            process.env.RMQ_EXCHANGE,
            'auth-code',
            Buffer.from(JSON.stringify({
                userId: existedVerifiedUser.id,
                uniqueId: startPayload
            }))
        );

        return bot.telegram.sendMessage(telegramChatId, 'Вы успешно авторизовались!');
    }

    if (existedVerifiedUser) {
        return bot.telegram.sendMessage(telegramChatId, 'Ваш телеграм уже привязан к аккаунту ResEz!');
    }

    const codeData = await validateVerifyCode(startPayload);

    if (!codeData) {
        return sendInfoMessage(telegramChatId);
    }

    channel.publish(
        process.env.RMQ_EXCHANGE,
        'verify',
        Buffer.from(JSON.stringify({
            userId: codeData.userId,
            telegramChatId
        }))
    );

    return ctx.reply('Ваш аккаунт успешно верифицирован!');
};

const sendCode = async (telegramChatId: string, message: string, code: string): Promise<Message.TextMessage> => {
    const formattedText = `${message} \`${code}\``;
    return await bot.telegram.sendMessage(telegramChatId, formattedText, { parse_mode: 'MarkdownV2' });
}

const getVerifiedUserByTelegramChatId = async (telegramChatId: string): Promise<{ id: number }> => {
    const { queue } = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue(
        'get-verified-user-by-telegram-chat-id',
        Buffer.from(JSON.stringify({ telegramChatId })), {
        replyTo: queue
    });

    return await new Promise((resolve) => {
        channel.consume(queue, (msg) => {
            const user = JSON.parse(msg.content.toString());
            resolve(user);
        }, { noAck: true });
    });
};

const validateVerifyCode = async (code: string): Promise<{ userId: number }> => {
    const { queue } = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue(
        'validate-verify-code',
        Buffer.from(JSON.stringify({ code })), {
        replyTo: queue
    });

    return await new Promise((resolve) => {
        channel.consume(queue, (msg) => {
            const user = JSON.parse(msg.content.toString());
            resolve(user);
        }, { noAck: true });
    });
};