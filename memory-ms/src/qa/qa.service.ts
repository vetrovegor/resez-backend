import { QaDto } from '@collection/dto/collection.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Qa } from './qa.entity';
import { Brackets, IsNull, Not, Repository } from 'typeorm';
import { shuffleArray } from '@utils/shuffle-array';
import { v4 } from 'uuid';
import { FileService } from '@file/file.service';
import { ConfigService } from '@nestjs/config';
import { extractFileName } from '@utils/extract-file-name';
import { PairsQuerySettings } from './interfaces';

@Injectable()
export class QaService {
    constructor(
        @InjectRepository(Qa)
        private readonly qaRepository: Repository<Qa>,
        private readonly fileService: FileService,
        private readonly configService: ConfigService
    ) {}

    async create(collectionId: number, pairs: QaDto[]) {
        for (const pair of pairs) {
            const createdQa = this.qaRepository.create({
                collection: { id: collectionId },
                ...pair
            });
            await this.qaRepository.save(createdQa);
        }
    }

    async delete(collectionId: number, shouldDeletePictures: boolean) {
        const pairs = await this.qaRepository.find({
            where: { collection: { id: collectionId } }
        });

        if (shouldDeletePictures) {
            for (const { questionPicture, answerPicture } of pairs) {
                this.fileService.deleteFile(extractFileName(questionPicture));
                this.fileService.deleteFile(extractFileName(answerPicture));
            }
        }

        return await this.qaRepository.remove(pairs);
    }

    async getCollectionPairsCount(collectionId: number) {
        return await this.qaRepository.count({
            where: { collection: { id: collectionId } }
        });
    }

    async getCollectionPairs(settings: Partial<PairsQuerySettings>) {
        const { collectionId, randomize, take, skip, search } = settings;
        let { seed } = settings;

        if (randomize) {
            seed = settings.seed ?? Math.random() * 2 - 1;
            await this.qaRepository.query(`SELECT setseed(${seed})`);
        }

        const [cards, totalCount] = await this.qaRepository
            .createQueryBuilder('questions_answers')
            .select()
            .where('questions_answers.collection_id = :collectionId', {
                collectionId
            })
            .andWhere(
                new Brackets(qb => {
                    if (search) {
                        qb.where(
                            'questions_answers.questionText ILIKE :search',
                            { search: `%${search}%` }
                        ).orWhere(
                            'questions_answers.answerText ILIKE :search',
                            { search: `%${search}%` }
                        );
                    }
                })
            )
            .orderBy(randomize && 'RANDOM()')
            .take(take)
            .skip(skip)
            .getManyAndCount();

        return {
            cards,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: cards.length,
            seed: !!randomize && seed
        };
    }

    async getCards(
        collectionId: number,
        take: number,
        skip: number,
        seed?: number,
        shuffleCards?: boolean,
        cardsAnswerOnFront?: boolean
    ) {
        const { cards: cardsData, ...paginationData } =
            await this.getCollectionPairs({
                collectionId,
                randomize: shuffleCards,
                take,
                skip,
                seed
            });

        const cards = cardsData.map(card => {
            const {
                id,
                questionText,
                questionPicture,
                answerText,
                answerPicture
            } = card;

            return {
                id,
                questionText: cardsAnswerOnFront ? answerText : questionText,
                questionPicture: cardsAnswerOnFront
                    ? answerPicture
                    : questionPicture,
                answerText: cardsAnswerOnFront ? questionText : answerText,
                answerPicture: cardsAnswerOnFront
                    ? questionPicture
                    : answerPicture
            };
        });

        return {
            cards,
            ...paginationData
        };
    }

    getOtherRandomPairs(
        elements: Partial<Qa>[],
        excludedId: number,
        count: number,
        nonEmptyAnswerText: boolean = false
    ) {
        const filteredElements = elements.filter(
            item =>
                item.id != excludedId &&
                (!nonEmptyAnswerText || item.answerText !== '')
        );
        shuffleArray(filteredElements);
        return filteredElements.slice(0, count);
    }

    getChoiceModeTask(
        {
            id,
            questionText,
            questionPicture,
            answerText,
            answerPicture
        }: Partial<Qa>,
        allPairs: Partial<Qa>[]
    ) {
        const otherPairs = this.getOtherRandomPairs(allPairs, id, 3, true);

        const choices = otherPairs.map(otherCard => {
            const { id, answerText, answerPicture } = otherCard;

            return {
                id,
                answerText,
                answerPicture,
                isCorrect: false
            };
        });

        choices.push({
            id,
            answerText,
            answerPicture,
            isCorrect: true
        });

        shuffleArray(choices);

        return {
            id,
            mode: 'CHOICE',
            questionText,
            questionPicture,
            choices
        };
    }

    getValidationModeTask(
        {
            id,
            questionText,
            questionPicture,
            answerText,
            answerPicture
        }: Partial<Qa>,
        allPairs: Partial<Qa>[]
    ) {
        const correctAnswer = answerText;

        if (Math.random() > 0.5) {
            const anotherCard = this.getOtherRandomPairs(allPairs, id, 1)[0];

            answerText = anotherCard.answerText;
            answerPicture = anotherCard.answerPicture;
        }

        return {
            id,
            mode: 'VALIDATION',
            questionText,
            questionPicture,
            answerText,
            answerPicture,
            isCorrect: answerText == correctAnswer,
            correctAnswer
        };
    }

    getWriteModeTask({
        id,
        questionText,
        questionPicture,
        answerText
    }: Partial<Qa>) {
        return {
            id,
            mode: 'WRITE',
            questionText,
            questionPicture,
            answerText
        };
    }

    async getTest(
        collectionId: number,
        shuffleTest: boolean,
        maxQuestions: number,
        answerChoiceMode: boolean,
        trueFalseMode: boolean,
        writeMode: boolean
    ) {
        const { cards: allPairs } = await this.getCollectionPairs({
            collectionId,
            randomize: shuffleTest
        });

        return allPairs
            .slice(0, maxQuestions)
            .map(card => {
                const modes = [];
                if (answerChoiceMode && card.answerText != '')
                    modes.push(this.getChoiceModeTask(card, allPairs));
                if (writeMode && card.answerText != '')
                    modes.push(this.getWriteModeTask(card));
                if (trueFalseMode)
                    modes.push(this.getValidationModeTask(card, allPairs));

                const randomIndex = Math.floor(Math.random() * modes.length);

                return modes[randomIndex];
            })
            .filter(task => task != null);
    }

    async getMatches(collectionId: number) {
        const { cards } = await this.getCollectionPairs({
            collectionId,
            take: 8
        });

        const matches = cards.flatMap(card => {
            const firstId = v4();
            const secondId = v4();
            const { questionText, questionPicture, answerText, answerPicture } =
                card;

            return [
                {
                    id: firstId,
                    text: questionText,
                    picture: questionPicture,
                    answerId: secondId
                },
                {
                    id: secondId,
                    text: answerText,
                    picture: answerPicture,
                    answerId: firstId
                }
            ];
        });

        shuffleArray(matches);

        return matches;
    }

    async getPictureNames() {
        const pairsData = await this.qaRepository.find({
            where: [
                { questionPicture: Not(IsNull()) },
                { answerPicture: Not(IsNull()) }
            ]
        });

        return pairsData.flatMap(pair => {
            const questionPicture = extractFileName(pair.questionPicture);
            const answerPicture = extractFileName(pair.answerPicture);

            return [questionPicture, answerPicture].filter(
                fileName => fileName !== null
            );
        });
    }

    async hasPictures(collectionId: number) {
        const count = await this.qaRepository
            .createQueryBuilder('qa')
            .leftJoinAndSelect('qa.collection', 'collection')
            .where(
                "collection.id = :collectionId AND ((qa.questionPicture IS NOT NULL AND qa.questionPicture <> '') OR (qa.answerPicture IS NOT NULL AND qa.answerPicture <> ''))",
                { collectionId }
            )
            .getCount();

        return count > 0;
    }
}
