import { ClientProxy } from '@nestjs/microservices';

export interface Options {
    client: ClientProxy;
    pattern: string;
    data: any;
    timeoutDuration?: number;
    defaultValueOnError?: any;
}
