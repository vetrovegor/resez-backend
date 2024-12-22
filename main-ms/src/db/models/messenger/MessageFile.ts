import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table
} from 'sequelize-typescript';

import Message from './Message';

@Table({
    timestamps: true,
    tableName: 'message_files'
})
class MessageFile extends Model {
    @Column({
        type: DataType.STRING
    })
    url: string;

    @Column({
        type: DataType.STRING
    })
    name: string;

    @Column({
        type: DataType.STRING
    })
    type: string;

    @Column({
        type: DataType.STRING
    })
    size: string;

    @ForeignKey(() => Message)
    @Column
    messageId: number;

    @BelongsTo(() => Message)
    message: Message;
}

export default MessageFile;
