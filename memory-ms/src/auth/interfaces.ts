export interface JwtPayload {
    id: number;
    nickname: string;
    telegramChatId: string;
    canUploadImages: boolean;
}
