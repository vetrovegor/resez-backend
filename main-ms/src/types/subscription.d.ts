export type SubscriptionDTO = {
    name: string;
    canUploadImages: boolean;
};

export type AssignsubscriptionDTO = {
    subscriptionId: number;
    userId: number;
    expiredDate: Date;
    isPermanent: boolean;
};

export type UserSubscription = {
    id: number;
    subscription: string;
    icon: string;
    price: number;
    canUploadImages: boolean;
    subscriptionExpiredDate: Date;
    isSubscriptionPermanent: boolean;
}