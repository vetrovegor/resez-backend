import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtPayload } from '../interfaces/interfaces';
import { Permission } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(
        ctx: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as JwtPayload;
        const requiredPermission = this.reflector.get(
            Permission,
            ctx.getHandler()
        );

        if (
            !user.permissions.some(
                permission => permission.permission == requiredPermission
            )
        ) {
            return false;
        }

        return true;
    }
}
