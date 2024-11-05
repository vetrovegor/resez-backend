import * as path from 'path';
import * as fs from 'fs';
import { MultipartFile } from '@fastify/multipart';

import STATIC_PATH from './consts';

export const saveFile = async (subPath: string, file: MultipartFile) => {
    console.log({ STATIC_PATH, subPath });
    const directory = path.join(STATIC_PATH, subPath);

    console.log({ directory });

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    const fileName = Date.now() + path.extname(file.filename);

    const buffer = await file.toBuffer();

    fs.writeFileSync(path.join(directory, fileName), buffer);

    return `${subPath}/${fileName}`;
};

export const deleteFile = (fileName: string) => {
    if (!fileName) {
        return;
    }

    const filePath = path.resolve(process.cwd(), 'uploads', fileName);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};
