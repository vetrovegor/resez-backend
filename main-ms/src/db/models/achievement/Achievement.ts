import { Table, Column, Model, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import AvatarDecoration from '../store/avatarDecoration/AvatarDecoration';
import UserAchievement from './UserAchievement';
import User from '../User';

@Table({
    timestamps: false,
    tableName: "achievements"
})
class Achievement extends Model {
    @Column({
        type: DataType.STRING,
    })
    achievement: string;
    
    @Column({
        type: DataType.TEXT,
    })
    icon: string;
    
    @Column({
        type: DataType.STRING,
    })
    description: string;
    
    @Column({
        type: DataType.INTEGER,
    })
    xp: number;
    
    @Column({
        type: DataType.INTEGER,
    })
    coins: number;

    @HasMany(() => AvatarDecoration, {
        onDelete: 'CASCADE'
    })
    avatarDecorations: AvatarDecoration[];

    @BelongsToMany(() => User, () => UserAchievement)
    users: User[];

    @HasMany(() => UserAchievement, {
        onDelete: 'CASCADE'
    })
    userAchievements: UserAchievement[];
}

export default Achievement;