import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

import User from '../User';
import PromoCode from './PromoCode';

@Table({
    timestamps: true,
    tableName: "users_promocodes"
})
class UserPromocode extends Model {
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => PromoCode)
    @Column({
        type: DataType.INTEGER
    })
    promoCodeId: number;

    @BelongsTo(() => PromoCode)
    promoCode: PromoCode;
}

export default UserPromocode;