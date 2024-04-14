import * as path from 'path';
import * as fs from 'fs';
import { UploadedFile } from 'express-fileupload';

class FileService {
    async saveFile(file: UploadedFile): Promise<string> {
        const fileName = Date.now() + path.extname(file.name);

        const staticPath = path.resolve(__dirname, '..', 'static');

        if (!fs.existsSync(staticPath)) {
            fs.mkdirSync(staticPath, { recursive: true });
        }

        fs.writeFileSync(path.join(staticPath, fileName), file.buffer);

        return fileName;
    }
}

export default new FileService();
