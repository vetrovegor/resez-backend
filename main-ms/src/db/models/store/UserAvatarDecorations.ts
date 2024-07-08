import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import User from '../User';
import AvatarDecoration from './AvatarDecorations';

@Table({
    timestamps: true,
    tableName: 'users_avatar_decorations'
})
class UserAvatarDecoration extends Model {
    @ForeignKey(() => AvatarDecoration)
    @Column({
        type: DataType.INTEGER
    })
    avatarDecorationId: number;

    @BelongsTo(() => AvatarDecoration)
    avatarDecoration: AvatarDecoration;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    userId: number;

    @BelongsTo(() => User)
    user: User;
}

export default UserAvatarDecoration;