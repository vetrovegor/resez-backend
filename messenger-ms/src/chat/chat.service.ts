import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
    constructor() {}

    async getChats() {
        return [];
    }
}
