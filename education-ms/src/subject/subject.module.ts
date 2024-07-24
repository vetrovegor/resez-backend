import { forwardRef, Module } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './subject.entity';
import { ScoreConversionModule } from '@score-conversion/score-conversion.module';
import { SubjectTaskModule } from '@subject-task/subject-task.module';
import { TaskModule } from '@task/task.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Subject]),
        CacheModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                isGlobal: true,
                store: redisStore,
                host: configService.get('REDIS_HOST'),
                port: configService.get('REDIS_PORT'),
                ttl: 10
            }),
            inject: [ConfigService]
        }),
        forwardRef(() => ScoreConversionModule),
        forwardRef(() => TaskModule),
        SubjectTaskModule
    ],
    controllers: [SubjectController],
    providers: [SubjectService],
    exports: [SubjectService]
})
export class SubjectModule {}
