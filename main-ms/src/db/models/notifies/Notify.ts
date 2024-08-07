import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany, HasMany } from 'sequelize-typescript';

import NotifyType from './NotifyType';
import User from '../User';
import UserNotify from './UserNotify';

@Table({
    timestamps: false,
    tableName: "notifies"
})
class Notify extends Model {
    @Column({
        type: DataType.STRING,
    })
    title: string;

    @Column({
        type: DataType.TEXT,
    })
    content: string;

    @Column({
        type: DataType.STRING,
    })
    author: string;

    @ForeignKey(() => User)
    @Column
    senderId: number;

    @BelongsTo(() => User)
    sender: User;

    @ForeignKey(() => NotifyType)
    @Column
    notifyTypeId: number;

    @BelongsTo(() => NotifyType)
    notify: NotifyType;

    // поле, что уведомление отложенное
    // idDelayed

    @BelongsToMany(() => User, () => UserNotify)
    users: User[];

    @HasMany(() => UserNotify, {
        onDelete: 'CASCADE'
    })
    userNotifies: UserNotify[];

    async getNotifyType(): Promise<string> {
        const notifyType = await NotifyType.findByPk(this.get('notifyTypeId'));

        return notifyType.get('type');
    }
}

export default Notify;