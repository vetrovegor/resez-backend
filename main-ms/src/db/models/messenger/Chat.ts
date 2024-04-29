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
import UserMessage from './UserMessage';

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

    @Column({
        type: DataType.STRING
    })
    inviteLink: string;

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

    @HasMany(() => UserMessage, {
        onDelete: 'CASCADE'
    })
    userMessages: UserMessage[];

    async getChatMemberIDs(): Promise<number[]> {
        const userChats = await UserChat.findAll({
            where: {
                chatId: this.get('id'),
                isLeft: false
            }
        });

        return userChats.map(userChat => userChat.get('userId'));
    }

    async getMembersCount(): Promise<number> {
        return await UserChat.count({
            where: {
                chatId: this.get('id'),
                isLeft: false
            }
        });
    }
}

export default Chat;
