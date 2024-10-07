import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import AvatarDecoration from '../store/avatarDecoration/AvatarDecoration';
import User from '../User';
import Achievement from './Achievement';

@Table({
    timestamps: true,
    tableName: "users_achievements"
})
class UserAchievement extends Model {
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Achievement)
    @Column({
        type: DataType.INTEGER
    })
    achievementId: number;

    @BelongsTo(() => Achievement)
    achievement: Achievement;
}

export default UserAchievement;