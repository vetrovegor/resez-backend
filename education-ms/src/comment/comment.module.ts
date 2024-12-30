import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { TaskModule } from '@task/task.module';

@Module({
    imports: [TypeOrmModule.forFeature([Comment]), TaskModule],
    controllers: [CommentController],
    providers: [CommentService]
})
export class CommentModule {}
