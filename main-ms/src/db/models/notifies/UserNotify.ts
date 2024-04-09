import { Table, Column, Model, DataType, ForeignKey, HasMany, BelongsTo } from 'sequelize-typescript';

import User from '../User';
import Notify from './Notify';
import { NotifyDTO } from 'types/notify';

@Table({
    timestamps: false,
    tableName: "users_notifies"
})
class UserNotify extends Model {
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isRead: boolean;

    @Column({
        type: DataType.BOOLEAN,
    })
    isSent: boolean;

    @Column({
        type: DataType.DATE,
    })
    date: Date;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Notify)
    @Column({
        type: DataType.INTEGER
    })
    notifyId: number;

    @BelongsTo(() => Notify)
    notify: Notify;

    async toDTO(): Promise<NotifyDTO> {
        const { notifyId, date, isRead } = this.get();

        const notify = await Notify.findByPk(notifyId);
        const { id, title, content, author } = notify.toJSON();

        return {
            id,
            type: await notify.getNotifyType(),
            title,
            content,
            author,
            date,
            isRead
        }
    }
}

export default UserNotify;