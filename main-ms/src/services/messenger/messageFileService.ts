import { UploadedFile } from 'express-fileupload';

import fileService from '../fileService';
import MessageFile from '../../db/models/messenger/MessageFile';

class MessageFileService {
    async createMessageFiles(messageId: number, files: UploadedFile[]) {
        for (const file of files) {
            const { name, mimetype: type, size } = file;
            const path = await fileService.saveFile('messenger/files', file);
            await MessageFile.create({ messageId, name, type, size, path });
        }
    }

    async deleteMessageFilesByMessageId(messageId: number) {
        const messageFiles = await MessageFile.findAll({
            where: { messageId }
        });

        for (const messageFile of messageFiles) {
            await fileService.deleteFile(messageFile.get('path'));
        }
    }
}

export default new MessageFileService();
