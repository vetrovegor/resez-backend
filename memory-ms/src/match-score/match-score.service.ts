import { Injectable } from '@nestjs/common';
import { MatchDto } from './dto/match.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchScore } from './match-score.enity';
import { Repository } from 'typeorm';
import { CollectionService } from '@collection/collection.service';
import { UserService } from '@user/user.service';

@Injectable()
export class MatchScoreService {
    constructor(
        @InjectRepository(MatchScore)
        private readonly matchScoreRepository: Repository<MatchScore>,
        private readonly collectionService: CollectionService,
        private readonly userService: UserService
    ) {}

    async create(userId: number, { collectionId, time }: MatchDto) {
        if (userId == -1) {
            return await this.getBestScores(collectionId, userId, time, 10);
        }

        await this.collectionService.findAccessibleCollectionById(
            collectionId,
            userId
        );

        const existedMatchScore = await this.matchScoreRepository.findOne({
            where: { userId, collection: { id: collectionId } }
        });

        if (existedMatchScore) {
            if (time < existedMatchScore.time) {
                await this.matchScoreRepository.save({
                    ...existedMatchScore,
                    time
                });
            }
        } else {
            await this.matchScoreRepository.save({
                userId,
                collection: { id: collectionId },
                time
            });
        }

        return await this.getBestScores(collectionId, userId, time, 10);
    }

    async getBestScores(
        collectionId: number,
        userId: number,
        time: number,
        take: number
    ) {
        const data = await this.matchScoreRepository.find({
            where: {
                collection: { id: collectionId }
            },
            order: { time: 'ASC', updatedAt: 'ASC' }
        });

        let iteration = 0;
        let place = data.length + 1;

        for (const matchScore of data) {
            iteration++;
            if (matchScore.userId == userId || matchScore.time > time) {
                place = iteration;
                break;
            }
        }

        const user = await this.userService.getById(userId);

        const scores = await Promise.all(
            data.slice(0, 1).map(async (matchScore, index) => {
                const user = await this.userService.getById(matchScore.userId);

                delete matchScore.userId;
                delete matchScore.collection;
                delete matchScore.createdAt;

                return {
                    ...matchScore,
                    place: index + 1,
                    user
                };
            })
        );

        return {
            scores,
            score: {
                time,
                place,
                user
            }
        };
    }
}
