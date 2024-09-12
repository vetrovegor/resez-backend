import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import User from '../../User';
import Theme from './Theme';

@Table({
    timestamps: true,
    tableName: 'users_themes'
})
class UserTheme extends Model {
    @ForeignKey(() => Theme)
    @Column({
        type: DataType.INTEGER
    })
    themeId: number;

    @BelongsTo(() => Theme)
    theme: Theme;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    userId: number;

    @BelongsTo(() => User)
    user: User;
}

export default UserTheme;