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
import Subscription from '../subscription/Subscription';
import { StoreContentType } from '../../../enums/store';
import Achievement from '../Achievement';
import User from '../User';
import UserAvatarDecoration from './UserAvatarDecorations';

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
        type: DataType.JSONB
    })
    options: object;

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

    @BelongsToMany(() => User, () => UserAvatarDecoration)
    users: User[];

    @HasMany(() => UserAvatarDecoration, {
        onDelete: 'CASCADE'
    })
    userAvatarDecorations: UserAvatarDecoration[];
}

export default AvatarDecoration;
