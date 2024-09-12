import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import AvatarDecoration from './store/avatarDecoration/AvatarDecoration';

@Table({
    timestamps: false,
    tableName: "achievements"
})
class Achievement extends Model {
    @Column({
        type: DataType.STRING,
    })
    achievement: string;

    @HasMany(() => AvatarDecoration, {
        onDelete: 'CASCADE'
    })
    avatarDecorations: AvatarDecoration[];
}

export default Achievement;