import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentRequestDto } from './dto/comment-request.dto';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { JwtPayload } from '@auth/interfaces/interfaces';
import { Public } from '@auth/decorators/public.decorator';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommentsReponseDto } from './dto/comment-response.dto';

@Controller('comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Post()
    @ApiOperation({ summary: 'Write comment' })
    @ApiResponse({
        status: 200,
        description: 'Success',
        schema: {
            type: 'object',
            properties: {
                comment: {
                    type: 'object',
                    $ref: '#/components/schemas/CommentDto'
                }
            }
        }
    })
    async create(
        @Body() dto: CommentRequestDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.commentService.create(dto, user.id);
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get comments' })
    @ApiResponse({
        status: 200,
        description: 'Success',
        type: CommentsReponseDto
    })
    async find(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('task_id', new ParseIntPipe())
        taskId: number
    ) {
        return await this.commentService.find(limit, offset, taskId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Edit comment' })
    @ApiResponse({
        status: 200,
        description: 'Success',
        schema: {
            type: 'object',
            properties: {
                comment: {
                    type: 'object',
                    $ref: '#/components/schemas/CommentDto'
                }
            }
        }
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    example: 'Updated comment'
                }
            }
        }
    })
    async update(
        @Param('id') @Param('id', ParseIntPipe) id: number,
        @Body() dto: { content: string },
        @CurrentUser() user: JwtPayload
    ) {
        return await this.commentService.update(id, dto.content, user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete comment' })
    @ApiResponse({
        status: 200,
        description: 'Success'
    })
    async delete(
        @Param('id') @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.commentService.delete(id, user.id);
        return HttpStatus.OK;
    }
}
