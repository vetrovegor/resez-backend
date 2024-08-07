import { Permissions } from '@auth/interfaces';
import { Permission } from '@auth/permission.decorator';
import { PermissionGuard } from '@auth/permission.guard';
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
export class AdminUploadController {
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
                        maxSize: 10000000,
                        message: 'Картинка не должна превышать 10 мб'
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
                        maxSize: 10000000,
                        message: 'Файл не должен превышать 10 мб'
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
