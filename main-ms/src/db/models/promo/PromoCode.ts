import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    BelongsTo,
    ForeignKey,
    BelongsToMany
} from 'sequelize-typescript';

import User from '../User';
import UserPromocode from './UserPromoCode';

@Table({
    timestamps: true,
    tableName: 'promo_codes'
})
class PromoCode extends Model {
    @Column({
        type: DataType.STRING
    })
    code: string;

    @Column({
        type: DataType.DATE
    })
    expiredDate: Date;

    @Column({
        type: DataType.INTEGER
    })
    limit: number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0
    })
    xp: number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0
    })
    coins: number;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isFinished: boolean;

    @ForeignKey(() => User)
    @Column
    creatorId: number;

    @BelongsTo(() => User)
    creator: User;

    @BelongsToMany(() => User, () => UserPromocode)
    users: User[];

    @HasMany(() => UserPromocode, {
        onDelete: 'CASCADE'
    })
    userPromocodes: UserPromocode[];
}

export default PromoCode;
