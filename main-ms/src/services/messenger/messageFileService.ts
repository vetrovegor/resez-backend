import fileService from '../fileService';
import MessageFile from '../../db/models/messenger/MessageFile';
import { MessageFileRequestBodyDTO } from '../../types/messenger';

class MessageFileService {
    async createMessageFiles(messageId: number, files: MessageFileRequestBodyDTO[]) {
        for (const file of files) {
            const { url, name, type, size } = file;
            await MessageFile.create({ messageId, url, name, type, size });
        }
    }

    // async deleteMessageFilesByMessageId(messageId: number) {
    //     const messageFiles = await MessageFile.findAll({
    //         where: { messageId }
    //     });

    //     for (const messageFile of messageFiles) {
    //         await fileService.deleteFile(messageFile.get('path'));
    //     }
    // }
}

export default new MessageFileService();
