import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
    async saveFile(file: Express.Multer.File): Promise<string> {
        try {
            const fileName = Date.now() + path.extname(file.originalname);

            const staticPath = path.resolve(process.cwd(), 'static');

            if (!fs.existsSync(staticPath)) {
                fs.mkdirSync(staticPath, { recursive: true });
            }

            fs.writeFileSync(path.join(staticPath, fileName), file.buffer);

            return fileName;
        } catch (e) {
            throw new HttpException(
                'Произошла ошибка при записи файла',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
