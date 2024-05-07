import { QaDto } from '@collection/dto/collection.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Qa } from './qa.entity';
import { Repository } from 'typeorm';
import { shuffleArray } from '@utils/shuffle-array';
import { v4 } from 'uuid';

@Injectable()
export class QaService {
    constructor(
        @InjectRepository(Qa)
        private readonly qaRepository: Repository<Qa>
    ) {}

    async create(collectionId: number, pairs: QaDto[]) {
        return await Promise.all(
            pairs.map(async pair => {
                const createdQa = this.qaRepository.create({
                    collection: { id: collectionId },
                    ...pair
                });
                await this.qaRepository.save(createdQa);
            })
        );
    }

    async delete(collectionId: number) {
        const pairs = await this.qaRepository.find({
            where: { collection: { id: collectionId } }
        });

        return await this.qaRepository.remove(pairs);
    }

    async getCollectionPairsCount(collectionId: number) {
        return await this.qaRepository.count({
            where: { collection: { id: collectionId } }
        });
    }

    async getCollectionPairs(collectionId: number, take?: number) {
        const pairs = await this.qaRepository.find({
            where: { collection: { id: collectionId } },
            take
        });

        return pairs.map(pair => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { collection, ...dto } = pair;

            return { ...dto };
        });
    }

    async getCards(
        collectionId: number,
        shuffleCards: boolean,
        answerOnFront: boolean
    ) {
        let cards = await this.getCollectionPairs(collectionId);

        if (shuffleCards) {
            shuffleArray(cards);
        }

        if (answerOnFront) {
            cards = cards.map(card => {
                const {
                    id,
                    questionText,
                    questionPicture,
                    answerText,
                    answerPicture
                } = card;

                return {
                    id,
                    questionText: answerText,
                    questionPicture: answerPicture,
                    answerText: questionText,
                    answerPicture: questionPicture
                };
            });
        }

        return cards;
    }

    async getMatches(collectionId: number) {
        const cards = await this.getCollectionPairs(collectionId, 8);

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
                    correctId: secondId
                },
                {
                    id: secondId,
                    text: answerText,
                    picture: answerPicture,
                    correctId: firstId
                }
            ];
        });

        shuffleArray(matches);

        return matches;
    }
}
