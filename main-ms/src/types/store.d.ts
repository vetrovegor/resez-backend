import { StoreContentType } from '../enums/store';

export type ProductDTO = {
    title: string;
    price: number;
    seasonStartDate: Date;
    seasonEndDate: Date;
    achievementId: number;
};

export type AvatarDecorationDTO = ProductDTO & {
    contentType: StoreContentType;
    options: string;
};
