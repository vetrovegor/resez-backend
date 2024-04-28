import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";

import User from "../User";
import Chat from "./Chat";

@Table({
    timestamps: false,
    tableName: 'users_chats'
})
class UserChat extends Model {
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    userId: number;

    @BelongsTo(() => User)
    user: User;

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
    isLeft: boolean;
}

export default UserChat;