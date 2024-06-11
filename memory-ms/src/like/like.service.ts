import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { Repository } from 'typeorm';
import { CollectionService } from '@collection/collection.service';

@Injectable()
export class LikeService {
    constructor(
        @InjectRepository(Like)
        private readonly likeRepository: Repository<Like>,
        @Inject(forwardRef(() => CollectionService))
        private readonly collectionService: CollectionService
    ) {}

    async toggle(collectionId: number, userId: number) {
        await this.collectionService.findAccessibleCollectionById(
            collectionId,
            userId
        );

        const existedLike = await this.likeRepository.findOne({
            where: { collectionId, userId }
        });

        if (existedLike) {
            return await this.likeRepository.remove(existedLike);
        }

        const createdLike = this.likeRepository.create({
            collectionId,
            userId
        });

        return await this.likeRepository.save(createdLike);
    }

    async getLikesCount(collectionId: number) {
        return await this.likeRepository.count({ where: { collectionId } });
    }

    async isCollectionLiked(collectionId: number, userId: number) {
        const data = await this.likeRepository.findOne({
            where: { collectionId, userId }
        });

        return !!data;
    }

    async getLikedCollectionIds(userId: number) {
        const data = await this.likeRepository.find({
            where: { userId },
            order: {
                createdAt: 'DESC'
            }
        });

        return data.map(item => item.collectionId);
    }
}
