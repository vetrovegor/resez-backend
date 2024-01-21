import { Telegraf, Context } from "telegraf";

import userService from "./userService";
import codeService from "./codeService";
import { Message } from "telegraf/types";
import { validate, version } from "uuid";

// подумать как исправить
type ContextWithStartPayload = Context & {
    startPayload: string
}

class TelegramService {
    private bot: Telegraf;

    init() {
        this.bot = new Telegraf(process.env.BOT_TOKEN);

        this.bot.start(ctx => this.handleStart(ctx));
        this.bot.command('me', ctx => this.handleMe(ctx));

        this.bot.launch();

        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }

    async sendCode(telegramChatId: string, message: string, code: string): Promise<Message.TextMessage> {
        const formattedText = `${message} \`${code}\``;

        return await this.bot.telegram.sendMessage(telegramChatId, formattedText, { parse_mode: 'MarkdownV2' });
    }

    private sendInfoMessage(telegramChatId: string): Promise<Message.TextMessage> {
        return this.bot.telegram.sendMessage(telegramChatId, 'Добро пожаловать!');
    }

    private async handleStart(ctx: ContextWithStartPayload): Promise<Message.TextMessage> {
        const startPayload = ctx.startPayload;
        const telegramChatId = ctx.message.chat.id.toString();

        if (!startPayload) {
            return this.sendInfoMessage(telegramChatId);
        }

        const existedVerifiedUser = await userService.getVerifiedUserByTelegramChatId(telegramChatId);

        if (validate(startPayload) && version(startPayload) == 4) {
            if (!existedVerifiedUser) {
                return this.bot.telegram.sendMessage(
                    telegramChatId,
                    'Ваш телеграм не привязан ни к одному аккаунту ReseEz. Пожалуйста, сначала зарегестрируйтесь. resez.ru/register'
                );
            }

            await codeService.createAndEmitAuthCode(existedVerifiedUser.get('id'), startPayload);

            return this.bot.telegram.sendMessage(telegramChatId, 'Вы успешно авторизовались!');
        }

        if (existedVerifiedUser) {
            return this.bot.telegram.sendMessage(telegramChatId, 'Ваш телеграм уже привязан к аккаунту ResEz!');
        }

        const codeData = await codeService.validateVerifyCode(startPayload);

        if (!codeData) {
            return this.sendInfoMessage(telegramChatId);
        }

        await userService.verifyUser(codeData.get('userId'), telegramChatId);

        return ctx.reply('Ваш аккаунт успешно верифицирован!');
    }

    private async handleMe(ctx: Context): Promise<Message.TextMessage> {
        const telegramChatId = ctx.message.chat.id.toString();
        const existedVerifiedUser = await userService.getVerifiedUserByTelegramChatId(telegramChatId);

        if (!existedVerifiedUser) {
            return this.bot.telegram.sendMessage(
                telegramChatId,
                'Ваш телеграм не привязан ни к одному аккаунту ReseEz. Пожалуйста, сначала зарегестрируйтесь. resez.ru/register'
            );
        }

        const { nickname, firstName, lastName, level, registrationDate, isBlocked } = existedVerifiedUser.toJSON();

        return ctx.reply(`Информация и пользователе:\nНикнейм: ${nickname}\nИмя: ${firstName || 'не указано'}\nФамилия: ${lastName || 'не указано'}\nУровень: ${level}\nДата регистрации: ${(new Date(registrationDate)).toLocaleDateString()}\nЗаблокирован: ${isBlocked ? 'Да': 'Нет'}`);
    }
}

export default new TelegramService();