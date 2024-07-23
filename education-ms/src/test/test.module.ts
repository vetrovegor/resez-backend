import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './test.entity';
import { SubjectModule } from '@subject/subject.module';
import { TaskModule } from '@task/task.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Test]),
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
        SubjectModule,
        TaskModule
    ],
    controllers: [TestController],
    providers: [TestService],
    exports: [TestService]
})
export class TestModule {}
