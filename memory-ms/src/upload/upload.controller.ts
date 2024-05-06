import {
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
    constructor(private readonly configService: ConfigService) {}

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const name = Date.now();
                    const extension = extname(file.originalname);
                    cb(null, `${name}${extension}`);
                }
            })
        })
    )
    uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: 1000000,
                        message: 'Картинка не должна превышать 1 мб'
                    }),
                    new FileTypeValidator({ fileType: 'image/*' })
                ]
            })
        )
        file: Express.Multer.File
    ) {
        return { url: this.configService.get('API_URL') + '/' + file.filename };
    }
}
