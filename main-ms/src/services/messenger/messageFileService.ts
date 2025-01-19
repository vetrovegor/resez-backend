import MessageFile from '@db/models/messenger/MessageFile';
import { formatFileSize } from '@utils';
import { MessageFileDTO, MessageFileRequestBodyDTO } from 'src/types/messenger';

class MessageFileService {
    async createMessageFiles(
        messageId: number,
        files: MessageFileRequestBodyDTO[]
    ) {
        for (const file of files) {
            const { url, name, type, size, width, height } = file;

            await MessageFile.create({
                messageId,
                url,
                name,
                type,
                size,
                width,
                height
            });
        }
    }

    createMessageFileDto(messageFile: MessageFile): MessageFileDTO {
        const { id, url, name, type, size, width, height } = messageFile.toJSON();

        return {
            id,
            url,
            name,
            type,
            size: formatFileSize(size),
            width,
            height
        };
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
