import { Op } from 'sequelize';

import MessageType from '@db/models/messenger/MessageType';
import { MessageTypes } from 'src/types/messenger';

const initialTypes: string[] = [
    MessageTypes.Default,
    MessageTypes.Deleted,
    MessageTypes.System,
    MessageTypes.Voice,
    MessageTypes.Video
];

class MessageTypeService {
    async initMessageTypes() {
        initialTypes.forEach(async type => {
            const existedType = await MessageType.findOne({
                where: {
                    type
                }
            });

            if (!existedType) {
                await MessageType.create({
                    type
                });
            }
        });

        return await MessageType.destroy({
            where: {
                type: {
                    [Op.notIn]: initialTypes
                }
            }
        });
    }

    async getMessageTypeIdByType(type: string): Promise<number> {
        const messageType = await MessageType.findOne({
            where: {
                type
            }
        });

        return messageType.get('id');
    }
}

export default new MessageTypeService();
