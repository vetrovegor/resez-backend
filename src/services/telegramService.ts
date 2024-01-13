import { Telegraf, Context } from "telegraf";

import userService from "./userService";
import codeService from "./codeService";
import { Message, ParseMode } from "telegraf/types";
import { validate, version } from "uuid";
import authService from "./authService";

// подумать как исправить
type ContextWithStartPayload = Context & {
    startPayload: string
}

class TelegramService {
    private bot: Telegraf;

    init() {
        this.bot = new Telegraf(process.env.BOT_TOKEN);

        this.bot.start(ctx => this.handleStart(ctx));

        this.bot.launch();

        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
    async sendCode(telegramChatId: string, message: string, code: string): Promise<Message.TextMessage> {
        const formattedText = `${message} \`${code}\``;

        // использовать sendMessageToChat
        return await this.bot.telegram.sendMessage(telegramChatId, formattedText, { parse_mode: 'MarkdownV2' });
    }

    private sendInfoMessage(telegramChatId: string): Promise<Message.TextMessage> {
        // использовать sendMessageToChat
        return this.bot.telegram.sendMessage(telegramChatId, 'Добро пожаловать!');
    }

    private async handleStart(ctx: ContextWithStartPayload): Promise<Message.TextMessage> {
        const startPayload = ctx.startPayload;
        const telegramChatId = ctx.message.chat.id.toString();

        if (!startPayload) {
            return this.sendInfoMessage(telegramChatId);
        }

        if (validate(startPayload) && version(startPayload) == 4) {
            const existedUser = await userService.getUserByTelegramChatId(telegramChatId);

            if (existedUser) {
                await codeService.createAndEmitAuthCode(existedUser.get('id'), startPayload);
                return this.bot.telegram.sendMessage(telegramChatId, 'Вы успешно авторизовались!');
            }
        }

        const codeData = await codeService.validateVerifyCode(startPayload);

        if (!codeData) {
            return this.sendInfoMessage(telegramChatId);
        }

        await userService.verifyUser(codeData.get('userId'), telegramChatId);

        return ctx.reply('Ваш аккаунт успешно верифицирован!');
    }
}

export default new TelegramService();