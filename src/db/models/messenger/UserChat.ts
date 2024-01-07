import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";

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

    @ForeignKey(() => Chat)
    @Column({
        type: DataType.INTEGER
    })
    chatId: number;
}

export default UserChat;