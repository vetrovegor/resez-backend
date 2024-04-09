import { Table, Column, Model, DataType, ForeignKey, HasMany } from 'sequelize-typescript';

import Message from './Message';

@Table({
    timestamps: false,
    tableName: "message_types"
})
class MessageType extends Model {
    @Column({
        type: DataType.STRING,
    })
    type: string;

    @HasMany(() => Message, {
        onDelete: 'CASCADE'
    })
    messages: Message[];
}

export default MessageType;