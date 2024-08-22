import { CollectionDto } from '@collection/dto/collection.dto';
import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class CollectionDtoPipe implements PipeTransform {
    transform(dto: CollectionDto) {
        console.log({ dto });
        
        dto.pairs = dto.pairs.map(item => {
            delete item.id;
            return item;
        });

        console.log({ dto });

        return dto;
    }
}
