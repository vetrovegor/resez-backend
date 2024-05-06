import { TypeOrmModule } from '@nestjs/typeorm';
import { QaModule } from '@qa/qa.module';
import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { Collection } from './collection.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Collection]),
        QaModule,
        ClientsModule.registerAsync([
            {
                name: 'USER_SERVICE',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [`${configService.get('RNQ_URL')}`],
                        queue: 'user-queue'
                    }
                }),
                inject: [ConfigService]
            }
        ])
    ],
    controllers: [CollectionController],
    providers: [CollectionService]
})
export class CollectionModule {}
