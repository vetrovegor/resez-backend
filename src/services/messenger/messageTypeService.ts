import { Op } from "sequelize";

import MessageType from "../../db/models/messenger/MessageType";
import { MessageTypes } from "types/messenger";

const initialMessageTypes: string[] = [
    MessageTypes.Default,
    MessageTypes.Deleted,
    MessageTypes.System,
    MessageTypes.Voice,
    MessageTypes.Video
];

class MessageTypeService {
    async initMessageTypes() {
        initialMessageTypes.forEach(async (type) => {
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
                    [Op.notIn]: initialMessageTypes
                }
            }
        });
    }

    async getMessageTypeIdByType(type: string): Promise<MessageType> {
        const messageType = await MessageType.findOne({
            where: {
                type
            }
        });

        return messageType.get('id');
    }
}

export default new MessageTypeService();