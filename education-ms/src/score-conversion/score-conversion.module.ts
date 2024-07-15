import { forwardRef, Module } from '@nestjs/common';
import { ScoreConversionService } from './score-conversion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreConversion } from './score-conversion.entity';
import { SubjectModule } from '@subject/subject.module';
import { SubjectTaskModule } from '@subject-task/subject-task.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ScoreConversion]),
        forwardRef(() => SubjectModule),
        SubjectTaskModule
    ],
    controllers: [],
    providers: [ScoreConversionService],
    exports: [ScoreConversionService]
})
export class ScoreConversionModule {}
