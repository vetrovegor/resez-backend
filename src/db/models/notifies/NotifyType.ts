import { Table, Column, Model, DataType, ForeignKey, HasMany } from 'sequelize-typescript';

import Notify from './Notify';

@Table({
    timestamps: false,
    tableName: "notifies_types"
})
class NotifyType extends Model {
    @Column({
        type: DataType.STRING,
    })
    type: string;

    @HasMany(() => Notify, {
        onDelete: 'CASCADE'
    })
    notifies: Notify[];
}

export default NotifyType;