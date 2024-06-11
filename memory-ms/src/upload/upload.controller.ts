import {
    Controller,
    Delete,
    FileTypeValidator,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { SharpPipe } from './sharp.pipe';
import { CurrentUser } from '@auth/current-user.decorator';
import { JwtPayload } from '@auth/interfaces';
import { UploadGuard } from './upload.guard';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @UseGuards(UploadGuard)
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: 1000000,
                        message: 'Картинка не должна превышать 1 мб'
                    }),
                    new FileTypeValidator({ fileType: 'image/*' })
                ]
            }),
            SharpPipe
        )
        fileName: string,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.uploadService.create(fileName, user.id);
    }

    @Delete('unused')
    async deleteUnused() {
        return await this.uploadService.deleteUnused();
    }

    @Delete(':id')
    async delete(
        @Param('id') uploadId: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.uploadService.delete(uploadId, user.id);
    }
}
