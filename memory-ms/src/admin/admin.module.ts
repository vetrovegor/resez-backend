import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { CollectionModule } from '@collection/collection.module';

@Module({
    imports: [CollectionModule],
    controllers: [AdminController]
})
export class AdminModule {}
