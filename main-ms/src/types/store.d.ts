import { StoreContentType } from '@enums/store';

export type ProductDTO = {
    title: string;
    price: number;
    requiredSubscriptionId: number;
    requiredAchievementId: number;
    seasonStartDate: Date;
    seasonEndDate: Date;
};

export type AvatarDecorationDTO = ProductDTO & {
    contentType: StoreContentType;
    options: string;
};

export type ThemeDTO = ProductDTO & {
    primary: string;
    light: string;
};

export type ThemeBasic = {
    id: number;
    primary: string;
    light: string;
}