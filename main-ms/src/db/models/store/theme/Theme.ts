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
import Category from '../Category';
import ProductCategory from '../ProductCategory';

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
    requiredAchievementId: number;

    @BelongsTo(() => Achievement)
    requiredAchievement: Achievement;

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

    @BelongsToMany(() => Category, () => ProductCategory)
    categories: Category[];

    @HasMany(() => ProductCategory)
    productCategories: ProductCategory[];
}

export default Theme;
