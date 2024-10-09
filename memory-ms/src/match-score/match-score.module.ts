import { Module } from '@nestjs/common';
import { MatchScoreService } from './match-score.service';
import { MatchScoreController } from './match-score.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchScore } from './match-score.enity';
import { CollectionModule } from '@collection/collection.module';

@Module({
    imports: [TypeOrmModule.forFeature([MatchScore]), CollectionModule],
    controllers: [MatchScoreController],
    providers: [MatchScoreService],
    exports: [MatchScoreService]
})
export class MatchScoreModule {}
