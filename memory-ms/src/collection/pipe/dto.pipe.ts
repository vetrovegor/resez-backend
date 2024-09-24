import { CollectionDto } from '@collection/dto/collection.dto';
import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class CollectionDtoPipe implements PipeTransform {
    transform(dto: CollectionDto) {
        dto.pairs = dto.pairs.map(item => {
            delete item.id;
            return item;
        });

        return dto;
    }
}
