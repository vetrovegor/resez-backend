import { LogType } from '@log/log.entity';
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class LogTypePipe implements PipeTransform {
    transform(value: string) {
        if (!Object.values(LogType).includes(value as LogType)) {
            throw new BadRequestException('Некорректное значение type');
        }

        return value;
    }
}
