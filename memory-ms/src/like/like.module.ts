import { Module, forwardRef } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { CollectionModule } from '@collection/collection.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Like]),
        forwardRef(() => CollectionModule)
    ],
    controllers: [LikeController],
    providers: [LikeService],
    exports: [LikeService]
})
export class LikeModule {}
