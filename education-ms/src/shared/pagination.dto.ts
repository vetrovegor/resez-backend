import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
    @ApiProperty({ example: 10 })
    totalCount: number;

    @ApiProperty({
        example: false
    })
    isLast: boolean;

    @ApiProperty({
        example: 5
    })
    elementsCount: number;
}
