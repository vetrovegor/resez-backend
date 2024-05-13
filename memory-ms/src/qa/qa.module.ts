import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Qa } from './qa.entity';
import { QaService } from './qa.service';
import { FileModule } from '@file/file.module';

@Module({
    imports: [TypeOrmModule.forFeature([Qa]), FileModule],
    providers: [QaService],
    exports: [QaService]
})
export class QaModule {}
