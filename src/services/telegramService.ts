import { Telegraf, Context  } from "telegraf";

import userService from "./userService";
import codeService from "./codeService";
import { Message } from "telegraf/types";

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

        return await this.bot.telegram.sendMessage(telegramChatId, formattedText, { parse_mode: 'MarkdownV2' });
    }

    private sendInfoMessage(telegramChatId: string): Promise<Message.TextMessage> {
        return this.bot.telegram.sendMessage(telegramChatId, 'Добро пожаловать!');
    }

    private async handleStart(ctx: ContextWithStartPayload): Promise<Message.TextMessage> {
        const startPayload = ctx.startPayload;
        const telegramChatId = ctx.message.chat.id.toString();

        if (!startPayload) {
            this.sendInfoMessage(telegramChatId);
        }
        
        // сделать проверку, если есть пользователь с таким chatId
        // В startPayload должен быть socketId
        // найти sessionId по этому socketId
        // авторизовать его
        // отправить emit с данными авторизации

        const codeData = await codeService.validateVerifyCode(startPayload);

        if (!codeData) {
            return this.sendInfoMessage(telegramChatId);
        }

        await userService.verifyUser(codeData.get('userId'), telegramChatId);

        return ctx.reply('Ваш аккаунт успешно верифицирован!');
    }
}

export default new TelegramService();