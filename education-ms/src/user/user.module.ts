import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'USER_SERVICE',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [`${configService.get('RMQ_URL')}`],
                        queue: 'user-queue'
                    }
                }),
                inject: [ConfigService]
            }
        ])
    ],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
