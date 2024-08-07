export const getSubscriptionExpiredhDate = (originalDate: Date) => {
    const expiredDate = new Date(originalDate);

    expiredDate.setMonth(expiredDate.getMonth() + 1);

    expiredDate.setHours(12, 0, 0, 0);

    if (expiredDate.getMonth() !== (originalDate.getMonth() + 1) % 12) {
        expiredDate.setDate(0);
    }

    return expiredDate;
};
