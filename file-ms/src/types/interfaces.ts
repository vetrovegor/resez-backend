export interface JwtPayload {
    id: number;
    nickname: string;
    telegramChatId: string;
    subscription: {
        subscription: string;
        canUploadImages: boolean;
    };
    permissions: {
        id: number;
        permission: string;
    }[];
}