import { Module } from '@nestjs/common';
import { ScoreConversionService } from './score-conversion.service';
import { ScoreConversionController } from './score-conversion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreConversion } from './score-conversion.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ScoreConversion])],
    controllers: [ScoreConversionController],
    providers: [ScoreConversionService]
})
export class ScoreConversionModule {}
