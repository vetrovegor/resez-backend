import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { SubjectModule } from '@subject/subject.module';

@Module({
    imports: [SubjectModule],
    controllers: [AdminController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ]
})
export class AdminModule {}
