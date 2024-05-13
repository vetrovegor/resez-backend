import { TypeOrmModule } from '@nestjs/typeorm';
import { QaModule } from '@qa/qa.module';
import { Module, forwardRef } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { Collection } from './collection.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SettingsModule } from '@settings/settings.module';
import { LikeModule } from '@like/like.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Collection]),
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
        ]),
        QaModule,
        SettingsModule,
        forwardRef(() => LikeModule)
    ],
    controllers: [CollectionController],
    providers: [CollectionService],
    exports: [CollectionService]
})
export class CollectionModule {}
