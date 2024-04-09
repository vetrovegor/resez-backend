import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    ForeignKey,
    BelongsTo,
    BelongsToMany
} from 'sequelize-typescript';

import Message from './Message';
import User from '../User';
import UserChat from './UserChat';

@Table({
    timestamps: true,
    tableName: 'chats'
})
class Chat extends Model {
    @Column({
        type: DataType.STRING
    })
    chat: string;

    @Column({
        type: DataType.BOOLEAN
    })
    isGroup: boolean;

    // isSaved / isFavorites

    @Column({
        type: DataType.STRING
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

    @HasMany(() => UserChat, {
        onDelete: 'CASCADE'
    })
    userChats: UserChat[];

    async getChatMembers(): Promise<number[]> {
        const userChats = await UserChat.findAll({
            where: {
                chatId: this.get('id')
            }
        });

        return userChats.map(userChat => userChat.get('userId'));
    }

    async getMembersCount(): Promise<number> {
        return await UserChat.count({
            where: {
                chatId: this.get('id')
            }
        });
    }
}

export default Chat;
