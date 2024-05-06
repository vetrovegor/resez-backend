import { QaDto } from '@collection/dto/collection.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Qa } from './qa.entity';
import { Repository } from 'typeorm';

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

    async getCollectionPairs(collectionId: number) {
        return await this.qaRepository.find({
            where: { collection: { id: collectionId } }
        });
    }
}
