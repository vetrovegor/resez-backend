import { QaDto } from '@collection/dto/collection.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Qa } from './qa.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { shuffleArray } from '@utils/shuffle-array';
import { v4 } from 'uuid';
import { FileService } from '@file/file.service';
import { ConfigService } from '@nestjs/config';
import { extractFileName } from '@utils/extract-file-name';

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

    async getCollectionPairs(
        collectionId: number,
        randomize: boolean = false,
        take?: number
    ) {
        // await this.qaRepository.query(`SELECT setseed(${0.5})`);

        return await this.qaRepository
            .createQueryBuilder('questions_answers')
            .select()
            .where('questions_answers.collection_id = :collectionId', {
                collectionId
            })
            .orderBy(randomize ? 'RANDOM()' : 'questions_answers.id', 'ASC')
            .take(take)
            .getMany();
    }

    async getCards(
        collectionId: number,
        shuffleCards: boolean,
        cardsAnswerOnFront: boolean
    ) {
        const cards = await this.getCollectionPairs(collectionId, shuffleCards);

        return cards.map(card => {
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
    }

    async getChoiceModeTask(
        {
            id,
            questionText,
            questionPicture,
            answerText,
            answerPicture
        }: Partial<Qa>,
        collectionId: number
    ) {
        const otherCards = await this.qaRepository.find({
            where: { collection: { id: collectionId }, id: Not(id) },
            take: 3
        });

        const choices = otherCards.map(otherCard => {
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

    async getValidationModeTask(
        {
            id,
            questionText,
            questionPicture,
            answerText,
            answerPicture
        }: Partial<Qa>,
        collectionId: number
    ) {
        let isCorrect = true;

        if (Math.random() > 0.5) {
            const anotherCard = await this.qaRepository
                .createQueryBuilder('questions_answers')
                .select()
                .where('questions_answers.collection_id = :collectionId', {
                    collectionId
                })
                .andWhere('questions_answers.id != :id', {
                    id
                })
                .orderBy('RANDOM()')
                .getOne();

            answerText = anotherCard.answerText;
            answerPicture = anotherCard.answerPicture;
            isCorrect = false;
        }

        return {
            id,
            mode: 'VALIDATION',
            questionText,
            questionPicture,
            answerText,
            answerPicture,
            isCorrect
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
        const cards = await this.getCollectionPairs(
            collectionId,
            shuffleTest,
            maxQuestions
        );

        return await Promise.all(
            cards.map(async card => {
                const modes = [];
                if (answerChoiceMode)
                    modes.push(
                        await this.getChoiceModeTask(card, collectionId)
                    );
                if (trueFalseMode)
                    modes.push(
                        await this.getValidationModeTask(card, collectionId)
                    );
                if (writeMode) modes.push(this.getWriteModeTask(card));

                const randomIndex = Math.floor(Math.random() * modes.length);

                return modes[randomIndex];
            })
        );
    }

    async getMatches(collectionId: number) {
        const cards = await this.getCollectionPairs(collectionId, false, 8);

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
}
