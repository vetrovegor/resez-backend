import { ApiProperty } from '@nestjs/swagger';

export class SourceDto {
    @ApiProperty({
        example: 23
    })
    id: number;

    @ApiProperty({
        example: 'Решу ЕГЭ'
    })
    source: string;

    @ApiProperty({
        example: 'reshu-ege'
    })
    slug: string;
}

export class SourceResponseDto {
    @ApiProperty({ type: SourceDto })
    source: SourceDto;
}

export class SourcesResponseDto {
    @ApiProperty({ type: [SourceDto] })
    sources: SourceDto[];
}
