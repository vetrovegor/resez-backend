import { Module } from '@nestjs/common';
import { SubThemeService } from './sub-theme.service';
import { SubThemeController } from './sub-theme.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTheme } from './sub-theme.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SubTheme])],
    controllers: [SubThemeController],
    providers: [SubThemeService],
    exports: [SubThemeService]
})
export class SubThemeModule {}
