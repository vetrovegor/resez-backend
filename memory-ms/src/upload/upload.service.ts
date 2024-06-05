import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Upload } from './upload.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { QaService } from '@qa/qa.service';

@Injectable()
export class UploadService {
    constructor(
        @InjectRepository(Upload)
        private readonly uploadRepository: Repository<Upload>,
        private readonly configService: ConfigService,
        private readonly qaService: QaService
    ) {}

    async create(fileName: string, userId: number) {
        const createdRecord = this.uploadRepository.create({
            fileName,
            userId
        });

        const savedRecoed = await this.uploadRepository.save(createdRecord);

        return {
            id: savedRecoed.id,
            url: this.configService.get('API_URL') + '/' + fileName
        };
    }

    async delete(id: number, userId: number) {
        const existedRecord = await this.uploadRepository.findOne({
            where: { id, userId }
        });

        if (!existedRecord) {
            throw new NotFoundException('Файл не найден');
        }

        await this.uploadRepository.remove(existedRecord);

        const filePath = path.join('uploads', existedRecord.fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return {
            id,
            url:
                this.configService.get('API_URL') + '/' + existedRecord.fileName
        };
    }

    async deleteUnused() {
        const pictureNames = await this.qaService.getPictureNames();
        const uploadFiles = fs.readdirSync('uploads');
        const deletedFiles = [];
        let totalDeletedSize = 0;

        for (const fileName of uploadFiles) {
            if (!pictureNames.includes(fileName)) {
                const record = await this.uploadRepository.findOne({
                    where: { fileName }
                });

                if (record) {
                    await this.uploadRepository.remove(record);
                }

                const filePath = path.join('uploads', fileName);
                const stats = fs.statSync(filePath);
                const size = Math.round((stats.size / 1000 / 1024) * 100) / 100;

                fs.unlinkSync(filePath);

                deletedFiles.push({
                    fileName,
                    size: size + ' mb'
                });

                totalDeletedSize += size;
            }
        }

        return {
            deletedFiles,
            deletedCount: deletedFiles.length,
            totalDeletedSize: totalDeletedSize + ' mb'
        };
    }
}
