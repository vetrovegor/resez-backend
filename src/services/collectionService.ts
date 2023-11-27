import { Op } from "sequelize";

import Collection from "../db/models/Collection";
import { CollectionFullInfo, CollectionShortInfo, QAPair } from "types/collection";
import QAService from "./QAService";
import { PaginationDTO } from "../dto/PaginationDTO";
import { ApiError } from "../apiError";

class CollectionService {
    async createCollection(userId: number, collection: string, description: string, isPrivate: boolean, QAPairs: QAPair[]): Promise<CollectionShortInfo> {
        const createdCollection = await Collection.create({
            userId,
            collection,
            description,
            isPrivate
        });

        await QAService.createQAFromPairs(QAPairs, createdCollection.id);

        return await createdCollection.toShortInfo();
    }

    async getUserCollections(userId: number, limit: number, offset: number): Promise<PaginationDTO<CollectionShortInfo>> {
        const collections = await Collection.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const collectionDtos = await Promise.all(
            collections.map(
                async collection => await collection.toShortInfo()
            )
        );

        const totalCount = await Collection.count({
            where: { userId }
        });

        return new PaginationDTO<CollectionShortInfo>("collections", collectionDtos, totalCount, limit, offset);
    }

    async getCollectionById(collectionId: number, userId: number): Promise<CollectionFullInfo> {
        const existedCollection = await Collection.findOne({
            where: {
                id: collectionId,
                [Op.or]: [
                    { isPrivate: false },
                    { userId }
                ]
            }
        });

        if (!existedCollection) {
            this.throwCollectionNotFound();
        }

        return await existedCollection.toFullInfo();
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

    async updateCollectionById(collectionId: number, userId: number, collection: string, description: string, isPrivate: boolean, QAPairs: QAPair[]): Promise<CollectionShortInfo> {
        const collectionData = await this.findUserCollection(collectionId, userId);

        if (!collectionData) {
            this.throwCollectionNotFound();
        }

        collectionData.collection = collection;
        collectionData.description = description;
        collectionData.isPrivate = isPrivate;
        await collectionData.save();

        await QAService.deleteQAByCollectionId(collectionId);
        await QAService.createQAFromPairs(QAPairs, collectionId);

        return await collectionData.toShortInfo();
    }

    throwCollectionNotFound() {
        throw ApiError.notFound('Коллекция не найдена');
    }
}

export default new CollectionService();