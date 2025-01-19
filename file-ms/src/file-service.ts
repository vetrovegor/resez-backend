import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';
import { v4 } from 'uuid';
import axios from 'axios';
import { MultipartFile } from '@fastify/multipart';

import STATIC_PATH from './consts';
import { ApiError } from './ApiError';
import { FileDto } from './FileDto';

// TODO: избавиться от subPath
export const saveFile = async (subPath: string, file: MultipartFile) => {
    // const directory = path.join(STATIC_PATH, subPath);

    fs.mkdirSync(STATIC_PATH, { recursive: true });

    let fileMimeType: string = null;
    let fileName: string = null;
    let filePath: string = null;
    let width: number | null = null;
    let height: number | null = null;

    const buffer = await file.toBuffer();

    if (file.mimetype.startsWith('image/')) {
        const outputFormat = 'jpeg';

        fileName = v4() + `.${outputFormat}`;
        filePath = path.join(STATIC_PATH, fileName);
        fileMimeType = `image/${outputFormat}`;

        const image = sharp(buffer)
            .resize(1024)
            .toFormat(outputFormat)
            .jpeg({ quality: 80 });

        const metadata = await image.metadata();
        
        width = metadata.width ?? null;
        height = metadata.height ?? null;

        await image.toFile(filePath);
    } else {
        fileName = v4() + path.extname(file.filename);
        filePath = path.join(STATIC_PATH, fileName);
        fileMimeType = file.mimetype;

        fs.writeFileSync(filePath, buffer);
    }

    return new FileDto(
        `${process.env.STATIC_URL}${subPath}/${fileName}`,
        file.filename,
        fileMimeType,
        fs.statSync(filePath).size,
        width,
        height
    );
};

export const saveFiles = async (multipartFiles: MultipartFile[]) => {
    const files = await Promise.all(
        multipartFiles.map(async file => await saveFile('', file))
    );

    return { files };
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

    return new FileDto(`${process.env.STATIC_URL}/${fileName}`);
};
