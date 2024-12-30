import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@shared/pagination.dto';
import { UserDto } from '@shared/user.dto';

export class CommentDto {
    @ApiProperty({
        example: 23
    })
    id: number;

    @ApiProperty({
        example: 'Comment on the task'
    })
    content: string;

    @ApiProperty({
        example: '2024-12-30T10:37:07.021Z'
    })
    createdAt: string;

    @ApiProperty({
        example: '2024-12-30T10:37:07.021Z'
    })
    updatedAt: string;

    @ApiProperty({
        type: UserDto
    })
    user: UserDto;
}

class CommentWithRepliesDto extends CommentDto {
    @ApiProperty({
        example: 5
    })
    repliesCount: number;

    @ApiProperty({
        type: [CommentDto]
    })
    replies: CommentDto[];
}

export class CommentsReponseDto extends PaginationDto {
    @ApiProperty()
    comments: CommentWithRepliesDto;
}
