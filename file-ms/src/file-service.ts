import * as path from 'path';
import * as fs from 'fs';
import { MultipartFile } from '@fastify/multipart';
import axios from 'axios';

import STATIC_PATH from './consts';
import { ApiError } from './ApiError';
import { FileDto } from './FileDto';

export const saveFile = async (subPath: string, file: MultipartFile) => {
    const directory = path.join(STATIC_PATH, subPath);

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    // TODO: сжатие картинок

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

// TODO: провалидировать размер, сжатие
export const uploadImageByUrl = async (url: string) => {
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    });

    if (!response.headers['content-type'].startsWith('image/')) {
        throw ApiError.badRequest('Файл должен быть картинкой');
    }

    const fileName = Date.now() + '.jpg';

    const directory = path.join(STATIC_PATH);

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    const filePath = path.join(directory, fileName);

    fs.writeFileSync(filePath, response.data);

    return `/${fileName}`;
};
