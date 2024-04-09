import { Op } from "sequelize";

import Collection from "../../db/models/memory/Collection";
import { Card, CollectionFullInfo, CollectionShortInfo, qaPair } from "types/collection";
import { PaginationDTO } from "../../dto/PaginationDTO";
import { ApiError } from "../../ApiError";
import qaService from "./qaService";
import userService from "../../services/userService";

class CollectionService {
    async createCollection(userId: number, collection: string, description: string, isPrivate: boolean, QAPairs: qaPair[]): Promise<CollectionShortInfo> {
        const createdCollection = await Collection.create({
            userId,
            collection,
            description,
            isPrivate
        });

        await qaService.createQAFromPairs(QAPairs, createdCollection.id);

        return await createdCollection.toShortInfo();
    }

    async getUserCollections(userId: number, limit: number, offset: number): Promise<PaginationDTO<CollectionShortInfo>> {
        const collections = await Collection.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const collectionDTOs = await Promise.all(
            collections.map(
                async collection => await collection.toShortInfo()
            )
        );

        const totalCount = await Collection.count({
            where: { userId }
        });

        return new PaginationDTO<CollectionShortInfo>("collections", collectionDTOs, totalCount, limit, offset);
    }

    async findAccessibleCollectionById(collectionId: number, userId: number): Promise<Collection> {
        const collection = await Collection.findOne({
            where: {
                id: collectionId,
                [Op.or]: [
                    { isPrivate: false },
                    { userId }
                ]
            }
        });

        if (!collection) {
            this.throwCollectionNotFound();
        }

        return collection;
    }

    async getCollectionById(collectionId: number, userId: number): Promise<CollectionFullInfo> {
        const collection = await this.findAccessibleCollectionById(collectionId, userId);

        return await collection.toFullInfo();
    }

    async findUserCollection(id: number, userId: number): Promise<Collection> {
        return await Collection.findOne({
            where: {
                id,
                userId
            }
        });
    }

    async deleteCollectionById(collectionId: number, userId: number): Promise<CollectionShortInfo> {
        const collection = await this.findUserCollection(collectionId, userId);

        if (!collection) {
            this.throwCollectionNotFound();
        }

        const collectionShortInfo = collection.toShortInfo();

        await collection.destroy();

        return collectionShortInfo;
    }

    async updateCollection(collectionId: number, userId: number, collection: string, description: string, isPrivate: boolean, QAPairs: qaPair[]): Promise<CollectionShortInfo> {
        const collectionData = await this.findUserCollection(collectionId, userId);

        if (!collectionData) {
            this.throwCollectionNotFound();
        }

        collectionData.set('collection', collection);
        collectionData.set('description', description);
        collectionData.set('isPrivate', isPrivate);
        await collectionData.save();

        await qaService.deleteQAByCollectionId(collectionId);
        await qaService.createQAFromPairs(QAPairs, collectionId);

        return await collectionData.toShortInfo();
    }

    // типизировать
    async getCardsByCollectionId(collectionId: number, userId: number): Promise<Card[]> {
        const collection = await this.findAccessibleCollectionById(collectionId, userId);

        const { isShuffleCards, isDefinitionCardFront } = await userService.getUserCollectionSettings(userId);

        return collection.getCards(isShuffleCards, isDefinitionCardFront);
    }

    throwCollectionNotFound() {
        throw ApiError.notFound('Коллекция не найдена');
    }
}

export default new CollectionService();