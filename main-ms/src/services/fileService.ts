import * as path from 'path';
import * as fs from 'fs';
import { UploadedFile } from 'express-fileupload';
import { STATIC_PATH } from '@consts/STATIC_PATH';

class FileService {
    async saveFile(subPath: string, file: UploadedFile): Promise<string> {
        const directory = path.join(STATIC_PATH, subPath);

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        const fileName = Date.now() + path.extname(file.name);

        fs.writeFileSync(path.join(directory, fileName), file.data);

        return `${subPath}/${fileName}`;
    }

    async deleteFile(fileName: string) {
        if (!fileName) {
            return;
        }

        const filePath = path.resolve(STATIC_PATH, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

export default new FileService();
