import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from "sequelize-typescript";

import User from "./User";
import QA from "./QA";
import { CollectionFullInfo, CollectionShortInfo } from "types/collection";

@Table({
    tableName: "collections"
})
class Collection extends Model {
    @Column({
        type: DataType.STRING
    })
    collection: string;

    @Column({
        type: DataType.STRING
    })
    description: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true
    })
    isPrivate: boolean;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @HasMany(() => QA, {
        onDelete: 'CASCADE'
    })
    QAs: QA[];

    private async getPairsCountAndUser(): Promise<{ pairsCount: number; user: User }> {
        const pairsCount = await QA.count({
            where: {
                collectionId: this.get('id')
            }
        });

        const user = await User.findByPk(this.get('userId'));

        return { pairsCount, user };
    }

    async toShortInfo(): Promise<CollectionShortInfo> {
        const { id, collection, description, isPrivate, createdAt, updatedAt } = this.get();
        const { pairsCount, user } = await this.getPairsCountAndUser();

        return {
            id,
            collection,
            pairsCount,
            description,
            isPrivate,
            createdAt,
            updatedAt,
            user: user.toPreview()
        };
    }

    async toFullInfo(): Promise<CollectionFullInfo> {
        const { id, collection, description, isPrivate, createdAt, updatedAt } = this.get();
        const { pairsCount, user } = await this.getPairsCountAndUser();

        const QAItems = await QA.findAll({
            where: {
                collectionId: id
            }
        });

        const QAPairs = QAItems.map(QAItem => QAItem.toDTO());

        return {
            id,
            collection,
            pairsCount,
            description,
            isPrivate,
            createdAt,
            updatedAt,
            user: user.toPreview(),
            QAPairs
        };
    }
}

export default Collection;