import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import User from '../User';

@Table({
    timestamps: false,
    tableName: 'subscriptions'
})
class Subscription extends Model {
    @Column({
        type: DataType.STRING
    })
    subscription: string;

    @Column({
        type: DataType.STRING
    })
    icon: string;
    
    @Column({
        type: DataType.INTEGER,
        defaultValue: 0
    })
    price: number;

    @Column({
        type: DataType.BOOLEAN
    })
    canUploadImages: boolean;

    @HasMany(() => User)
    users: User[];
}

export default Subscription;
