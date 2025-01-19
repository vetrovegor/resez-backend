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

    // TODO: должен быть integer?
    @Column({
        type: DataType.STRING
    })
    size: string;

    @Column({
        type: DataType.INTEGER
    })
    width: number;

    @Column({
        type: DataType.INTEGER
    })
    height: number;

    @ForeignKey(() => Message)
    @Column
    messageId: number;

    @BelongsTo(() => Message)
    message: Message;
}

export default MessageFile;
