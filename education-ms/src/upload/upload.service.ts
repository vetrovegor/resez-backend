import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileDto } from './dto/file.dto';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

@Injectable()
export class UploadService {
    constructor(private readonly configService: ConfigService) {}

    createFileDto(fileName: string) {
        return new FileDto(`${this.configService.get('API_URL')}/${fileName}`);
    }

    async saveFile(file: Express.Multer.File) {
        try {
            const fileName = Date.now() + path.extname(file.originalname);

            const staticPath = path.resolve(process.cwd(), 'uploads');

            if (!fs.existsSync(staticPath)) {
                fs.mkdirSync(staticPath, { recursive: true });
            }

            const filePath = path.join(staticPath, fileName);

            fs.writeFileSync(filePath, file.buffer);

            return new FileDto(
                `${this.configService.get('API_URL')}/${fileName}`
            );
        } catch (e) {
            throw new HttpException(
                `Произошла ошибка при записи файла: ${e}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async uploadImageByUrl(url: string) {
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });

        if (!response.headers['content-type'].startsWith('image/')) {
            throw new BadRequestException('Файл должен быть картинкой');
        }

        const fileName = Date.now() + '.jpg';

        const staticPath = path.resolve(process.cwd(), 'uploads');

        if (!fs.existsSync(staticPath)) {
            fs.mkdirSync(staticPath, { recursive: true });
        }

        const filePath = path.join(staticPath, fileName);

        fs.writeFileSync(filePath, response.data);

        return new FileDto(`${this.configService.get('API_URL')}/${fileName}`);
    }
}
