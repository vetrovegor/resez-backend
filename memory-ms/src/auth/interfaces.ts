export interface JwtPayload {
    id: number;
    nickname: string;
    telegramChatId: string;
    subscription: {
        name: string;
        canUploadImages: boolean;
    };
}
