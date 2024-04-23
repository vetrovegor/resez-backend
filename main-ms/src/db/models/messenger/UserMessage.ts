import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import User from '../User';
import Message from './Message';
import Chat from './Chat';

@Table({
    timestamps: false,
    tableName: "users_messages"
})
class UserMessage extends Model {
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Message)
    @Column({
        type: DataType.INTEGER
    })
    messageId: number;

    @BelongsTo(() => Message)
    message: Message;

    @ForeignKey(() => Chat)
    @Column({
        type: DataType.INTEGER
    })
    chatId: number;

    @BelongsTo(() => Chat)
    chat: Chat;
    
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isRead: boolean;
    
    @Column({
        type: DataType.DATE
    })
    readDate: Date;
}

export default UserMessage;