import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Log])],
    providers: [
        LogService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ],
    exports: [LogService]
})
export class LogModule {}
