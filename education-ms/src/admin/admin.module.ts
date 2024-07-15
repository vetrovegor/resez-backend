import { Module } from '@nestjs/common';
import { AdminSubjectController } from './admin-subject.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { SubjectModule } from '@subject/subject.module';
import { ScoreConversionModule } from '@score-conversion/score-conversion.module';

@Module({
    imports: [SubjectModule, ScoreConversionModule],
    controllers: [AdminSubjectController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ]
})
export class AdminModule {}
