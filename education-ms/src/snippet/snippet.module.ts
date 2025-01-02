import { forwardRef, Module } from '@nestjs/common';
import { SnippetService } from './snippet.service';
import { Snippet } from './snippet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectModule } from '@subject/subject.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Snippet]),
        forwardRef(() => SubjectModule)
    ],
    providers: [SnippetService],
    exports: [SnippetService]
})
export class SnippetModule {}
