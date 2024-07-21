import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload, Permissions } from './interfaces';

@Injectable()
export class VerifyTaskGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user as JwtPayload;
        const { isVerified } = request.body;

        if (
            isVerified &&
            !user.permissions.some(
                permission => permission.permission == Permissions.VerifyTasks
            )
        ) {
            return false;
        }

        return true;
    }
}
