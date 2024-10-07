import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
        @Inject(forwardRef(() => CollectionService))
        private readonly collectionService: CollectionService,
        private readonly userService: UserService
    ) {}

    async create(userId: number, { collectionId, time }: MatchDto) {
        if (userId !== -1) {
            await this.collectionService.findAccessibleCollectionById(
                collectionId,
                userId
            );

            await this.matchScoreRepository.save({
                userId,
                collection: { id: collectionId },
                time
            });
        }

        return await this.getBestScores(collectionId, 10);
    }

    async getBestScores(collectionId: number, take: number) {
        const subQuery = this.matchScoreRepository
            .createQueryBuilder('ms')
            .select('MIN(ms.time)', 'minTime')
            .where('ms.userId = matches_scores.userId')
            .andWhere('ms.collection_id = :collectionId', { collectionId });

        const data = await this.matchScoreRepository
            .createQueryBuilder('matches_scores')
            .select('matches_scores.id', 'id')
            .addSelect('matches_scores.userId', 'userId')
            .addSelect('matches_scores.time', 'time')
            .addSelect('matches_scores.createdAt', 'createdAt')
            .where('matches_scores.collection_id = :collectionId', {
                collectionId
            })
            .andWhere(`matches_scores.time = (${subQuery.getQuery()})`)
            .groupBy(
                'matches_scores.id, matches_scores.userId, matches_scores.time, matches_scores.createdAt'
            )
            .orderBy('time', 'ASC')
            .limit(take)
            .getRawMany();

        const scores = await Promise.all(
            data.map(async (matchScore, index) => {
                const user = await this.userService.getById(matchScore.userId);

                delete matchScore.userId;
                delete matchScore.collection;

                return {
                    place: index + 1,
                    ...matchScore,
                    user
                };
            })
        );

        return { scores };
    }
}
