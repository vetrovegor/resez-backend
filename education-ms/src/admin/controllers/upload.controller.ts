import 'dotenv/config';
import { Permissions } from '@auth/interfaces/interfaces';
import { Permission } from '@auth/decorators/permission.decorator';
import { PermissionGuard } from '@auth/guards/permission.guard';
import {
    Body,
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageDto } from '@upload/dto/image.dto';
import { SharpPipe } from '@upload/pipe/sharp.pipe';
import { UploadService } from '@upload/upload.service';

@Controller('admin/upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post('image')
    @Permission(Permissions.CreateTasks)
    @UseGuards(PermissionGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: Number(process.env.MAX_FILE_SIZE_MB) * 1000000,
                        message: `Картинка не должна превышать ${process.env.MAX_FILE_SIZE_MB} мб`
                    }),
                    new FileTypeValidator({ fileType: 'image/*' })
                ]
            }),
            SharpPipe
        )
        fileName: string
    ) {
        return this.uploadService.createFileDto(fileName);
    }

    @Post('file')
    @Permission(Permissions.CreateTasks)
    @UseGuards(PermissionGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: Number(process.env.MAX_FILE_SIZE_MB) * 1000000,
                        message: `Файл не должен превышать ${process.env.MAX_FILE_SIZE_MB} мб`
                    })
                ]
            })
        )
        file: Express.Multer.File
    ) {
        return this.uploadService.saveFile(file);
    }

    @Post('image-by-url')
    @Permission(Permissions.CreateTasks)
    @UseGuards(PermissionGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadImageByUrl(@Body() dto: ImageDto) {
        return this.uploadService.uploadImageByUrl(dto.url);
    }
}
