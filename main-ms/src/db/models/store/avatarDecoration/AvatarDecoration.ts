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
import { StoreContentType } from '@enums/store';
import Achievement from '../../achievement/Achievement';
import User from '../../User';
import UserAvatarDecoration from './UserAvatarDecoration';
import Category from '../Category';
import ProductCategory from '../ProductCategory';

@Table({
    timestamps: true,
    tableName: 'avatar_decorations'
})
class AvatarDecoration extends Model {
    @Column({
        type: DataType.STRING
    })
    title: string;

    @Column({
        type: DataType.ENUM(...Object.values(StoreContentType))
    })
    contentType: StoreContentType;

    @Column({
        type: DataType.STRING
    })
    contentUrl: string;

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
        type: DataType.JSONB
    })
    options: object;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isPublished: boolean;

    @BelongsToMany(() => User, () => UserAvatarDecoration)
    users: User[];

    @HasMany(() => UserAvatarDecoration, {
        onDelete: 'CASCADE'
    })
    userAvatarDecorations: UserAvatarDecoration[];

    @BelongsToMany(() => Category, () => ProductCategory)
    categories: Category[];

    @HasMany(() => ProductCategory)
    productCategories: ProductCategory[];
}

export default AvatarDecoration;
