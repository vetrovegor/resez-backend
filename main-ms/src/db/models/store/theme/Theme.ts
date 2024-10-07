import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    BelongsToMany,
    HasMany
} from 'sequelize-typescript';
import Subscription from '../../subscription/Subscription';
import Achievement from '../../achievement/Achievement';
import User from '../../User';
import UserTheme from './UserTheme';

@Table({
    timestamps: true,
    tableName: 'themes'
})
class Theme extends Model {
    @Column({
        type: DataType.STRING
    })
    title: string;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0
    })
    price: number;

    @ForeignKey(() => Subscription)
    @Column({
        type: DataType.INTEGER
    })
    requiredSubscriptionId: number;

    @BelongsTo(() => Subscription)
    requiredSubscription: Subscription;

    @ForeignKey(() => Achievement)
    @Column
    achievementId: number;

    @BelongsTo(() => Achievement)
    achievement: Achievement;

    @Column({
        type: DataType.DATE
    })
    seasonStartDate: Date;

    @Column({
        type: DataType.DATE
    })
    seasonEndDate: Date;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isPublished: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isArchived: boolean;

    @Column({
        type: DataType.STRING
    })
    primary: string;

    @Column({
        type: DataType.STRING
    })
    light: string;

    @BelongsToMany(() => User, () => UserTheme)
    users: User[];

    @HasMany(() => UserTheme, {
        onDelete: 'CASCADE'
    })
    userThemes: UserTheme[];
}

export default Theme;
