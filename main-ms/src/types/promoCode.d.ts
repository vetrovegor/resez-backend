import { UserPreview } from "./user";

export type PromoCodeBodyDTO = {
    code: string;
    expiredDate: string;
    limit: number;
    xp: number;
    coins: number;
};

export type UserPromocodeUsage = UserPreview & {
    date: Date;
}