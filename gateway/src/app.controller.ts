import { Controller, Get, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
    @Get('api/health')
    getHello() {
        return HttpStatus.OK;
    }
}
