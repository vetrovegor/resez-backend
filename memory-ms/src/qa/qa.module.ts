import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Qa } from './qa.entity';
import { QaService } from './qa.service';

@Module({
    imports: [TypeOrmModule.forFeature([Qa])],
    providers: [QaService],
    exports: [QaService]
})
export class QaModule {}
