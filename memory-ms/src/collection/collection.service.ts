import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from './collection.entity';
import { Repository } from 'typeorm';
import { CollectionDto } from './dto/collection.dto';
import { QaService } from '@qa/qa.service';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMqService } from '@rabbit-mq/rabbit-mq.service';

@Injectable()
export class CollectionService {
    constructor(
        @InjectRepository(Collection)
        private readonly collectionRepository: Repository<Collection>,
        private readonly qaService: QaService,
        private readonly rabbitMqService: RabbitMqService,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy
    ) {}

    async getShortInfo(collectionData: Collection) {
        const user = await this.rabbitMqService.sendRequest({
            client: this.userClient,
            pattern: 'preview',
            data: collectionData.userId
        });

        delete collectionData.userId;

        const pairsCount = await this.qaService.getCollectionPairsCount(
            collectionData.id
        );

        return {
            ...collectionData,
            user,
            pairsCount
        };
    }

    async create(
        userId: number,
        { collection, description, isPrivate, pairs }: CollectionDto
    ) {
        const createdCollection = this.collectionRepository.create({
            collection,
            description,
            isPrivate,
            userId
        });

        const savedCollection =
            await this.collectionRepository.save(createdCollection);

        await this.qaService.create(savedCollection.id, pairs);

        return await this.getShortInfo(savedCollection);
    }

    async findAll(userId: number, take: number, skip: number) {
        const collectionsData = await this.collectionRepository.find({
            where: { userId },
            take,
            skip
        });

        const collections = await Promise.all(
            collectionsData.map(async collection =>
                this.getShortInfo(collection)
            )
        );

        const totalCount = await this.collectionRepository.count({
            where: { userId }
        });

        return {
            collections,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: collections.length
        };
    }

    async findAccessibleCollectionById(id: number, userId: number) {
        const collection = await this.collectionRepository.findOne({
            where: [
                { id, isPrivate: false },
                { id, userId }
            ]
        });

        if (!collection) {
            throw new NotFoundException();
        }

        return collection;
    }

    async findOne(id: number, userId: number) {
        const collection = await this.findAccessibleCollectionById(id, userId);

        const collectionShortInfo = await this.getShortInfo(collection);

        const pairs = await this.qaService.getCollectionPairs(id);

        return {
            ...collectionShortInfo,
            pairs
        };
    }

    async getByIdAndUserId(id: number, userId: number) {
        const collection = await this.collectionRepository.findOne({
            where: { id, userId }
        });

        if (!collection) {
            throw new NotFoundException();
        }

        return collection;
    }

    async delete(id: number, userId: number) {
        const collectionData = await this.getByIdAndUserId(id, userId);

        const collection = await this.getShortInfo(collectionData);

        await this.collectionRepository.remove(collectionData);

        return { collection };
    }

    async update(
        id: number,
        userId: number,
        { collection, description, isPrivate, pairs }: CollectionDto
    ) {
        const collectionData = await this.getByIdAndUserId(id, userId);

        const updatedRecord = Object.assign(collectionData, {
            collection,
            description: description || null,
            isPrivate
        });

        const updatedCollection =
            await this.collectionRepository.save(updatedRecord);

        await this.qaService.delete(id);
        await this.qaService.create(id, pairs);

        const collectionShortInfo = await this.getShortInfo(updatedCollection);

        return { collection: collectionShortInfo };
    }
}
