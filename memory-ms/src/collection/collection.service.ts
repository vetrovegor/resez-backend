import {
    Inject,
    Injectable,
    NotFoundException,
    forwardRef
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from './collection.entity';
import { ILike, Repository } from 'typeorm';
import { CollectionDto } from './dto/collection.dto';
import { QaService } from '@qa/qa.service';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMqService } from '@rabbit-mq/rabbit-mq.service';
import { SettingsService } from '@settings/settings.service';
import { LikeService } from '@like/like.service';

@Injectable()
export class CollectionService {
    constructor(
        @InjectRepository(Collection)
        private readonly collectionRepository: Repository<Collection>,
        private readonly qaService: QaService,
        private readonly settingsService: SettingsService,
        private readonly rabbitMqService: RabbitMqService,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
        @Inject(forwardRef(() => LikeService))
        private readonly likeService: LikeService
    ) {}

    async getShortInfo(collectionData: Collection, userId: number) {
        const user = await this.rabbitMqService.sendRequest({
            client: this.userClient,
            pattern: 'preview',
            data: collectionData.userId
        });

        delete collectionData.userId;

        const pairsCount = await this.qaService.getCollectionPairsCount(
            collectionData.id
        );

        const likesCount = await this.likeService.getLikesCount(
            collectionData.id
        );

        const isLiked = await this.likeService.isCollectionLiked(
            collectionData.id,
            userId
        );

        return {
            ...collectionData,
            user,
            pairsCount,
            likesCount,
            isLiked
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

        return await this.getShortInfo(savedCollection, userId);
    }

    async findAll(
        userId: number,
        take: number,
        skip: number,
        targetUserId: number,
        search: string
    ) {
        const collectionsData = await this.collectionRepository.find({
            where: {
                ...(!targetUserId || targetUserId === userId
                    ? { userId }
                    : { userId: targetUserId, isPrivate: false }),
                ...(search && {
                    collection: ILike(`%${search}%`)
                })
            },
            order: {
                createdAt: 'DESC'
            },
            take,
            skip
        });

        const collections = await Promise.all(
            collectionsData.map(async collection =>
                this.getShortInfo(collection, userId)
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
            throw new NotFoundException('Коллекция не найдена');
        }

        return collection;
    }

    async findOne(id: number, userId: number) {
        const collection = await this.findAccessibleCollectionById(id, userId);

        const collectionShortInfo = await this.getShortInfo(collection, userId);

        const { cards: pairs } = await this.qaService.getCollectionPairs({
            collectionId: id
        });

        return {
            ...collectionShortInfo,
            pairs
        };
    }

    async findPairs(
        id: number,
        userId: number,
        take: number,
        skip: number,
        search: string
    ) {
        await this.findAccessibleCollectionById(id, userId);

        const data = await this.qaService.getCollectionPairs({
            collectionId: id,
            take,
            skip,
            search
        });

        return data;
    }

    async findCards(
        id: number,
        userId: number,
        take: number,
        skip: number,
        seed: number
    ) {
        await this.findAccessibleCollectionById(id, userId);

        const { settings } = await this.settingsService.get(userId);

        const { shuffleCards, cardsAnswerOnFront } = settings;

        const data = await this.qaService.getCards(
            id,
            take,
            skip,
            seed,
            shuffleCards,
            cardsAnswerOnFront
        );

        return data;
    }

    async getTest(id: number, userId: number) {
        await this.findAccessibleCollectionById(id, userId);

        const { settings } = await this.settingsService.get(userId);

        const {
            shuffleTest,
            maxQuestions,
            answerChoiceMode,
            trueFalseMode,
            writeMode
        } = settings;

        const test = await this.qaService.getTest(
            id,
            shuffleTest,
            maxQuestions,
            answerChoiceMode,
            trueFalseMode,
            writeMode
        );

        return { test };
    }

    async getMatches(id: number, userId: number) {
        await this.findAccessibleCollectionById(id, userId);

        const matches = await this.qaService.getMatches(id);

        return { matches };
    }

    async getByIdAndUserId(id: number, userId: number) {
        const collection = await this.collectionRepository.findOne({
            where: { id, userId }
        });

        if (!collection) {
            throw new NotFoundException('Коллекция не найдена');
        }

        return collection;
    }

    async delete(id: number, userId: number) {
        const collectionData = await this.getByIdAndUserId(id, userId);

        const collection = await this.getShortInfo(collectionData, userId);

        await this.qaService.delete(id, true);

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

        await this.qaService.delete(id, false);
        await this.qaService.create(id, pairs);

        const collectionShortInfo = await this.getShortInfo(
            updatedCollection,
            userId
        );

        return { collection: collectionShortInfo };
    }
}
