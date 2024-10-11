export type SubscriptionDTO = {
    name: string,
    canUploadImages: boolean
}

export type AssignsubscriptionDTO = {
    subscriptionId: number;
    userId: number;
    expiredDate: Date;
    isPermanent: boolean;
}