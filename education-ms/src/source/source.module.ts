import { Module } from '@nestjs/common';
import { SourceService } from './source.service';
import { SourceController } from './source.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from './source.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Source])],
    controllers: [SourceController],
    providers: [SourceService],
    exports: [SourceService]
})
export class SourceModule {}
