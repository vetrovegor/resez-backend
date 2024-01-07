import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';

import Message from './Message';
import User from '../User';
import UserChat from './UserChat';

@Table({
    timestamps: true,
    tableName: "chats"
})
class Chat extends Model {
    @Column({
        type: DataType.STRING,
    })
    chat: string;

    @Column({
        type: DataType.BOOLEAN,
    })
    isGroup: boolean;

    @Column({
        type: DataType.STRING,
    })
    picture: string;

    @HasMany(() => Message, {
        onDelete: 'CASCADE'
    })
    messages: Message[];    

    @ForeignKey(() => User)
    @Column
    adminId: number;

    @BelongsTo(() => User)
    admin: User;

    @BelongsToMany(() => User, () => UserChat)
    users: User[];
}

export default Chat;