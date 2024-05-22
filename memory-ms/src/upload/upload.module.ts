import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './upload.entity';
import { QaModule } from '@qa/qa.module';

@Module({
    imports: [TypeOrmModule.forFeature([Upload]), QaModule],
    controllers: [UploadController],
    providers: [UploadService]
})
export class UploadModule {}
