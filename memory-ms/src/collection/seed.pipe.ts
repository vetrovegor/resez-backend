import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SeedPipe implements PipeTransform {
    transform(value: any) {
        if (!value) {
            return;
        }

        if (isNaN(value)) {
            throw new BadRequestException('Seed должен быть числом');
        }

        const seed = parseFloat(value);

        if (seed < -1 || seed > 1) {
            throw new BadRequestException(
                'Seed должен быть в диапазоне от -1 до 1'
            );
        }

        return seed;
    }
}
