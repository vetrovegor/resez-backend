import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
    @ApiProperty({
        example: 1
    })
    id: number;

    @ApiProperty({
        example: 'xw1nchester'
    })
    nickname: string;

    @ApiProperty({
        example: 'http://localhost:8080/api/static/1704801417793.jpg'
    })
    avatar: string;
}
