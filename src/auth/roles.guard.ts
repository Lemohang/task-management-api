
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { UserRole } from '../users/user-role.enum.js';

import { AuthenticatedUser } from './authenticated-user.interface.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles =
      this.reflector.get<UserRole[]>(
        'roles',
        context.getHandler(),
      );

    // If the endpoint has no role requirement,
    // allow the request.
    if (!requiredRoles) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{
        user: AuthenticatedUser;
      }>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'User information not found',
      );
    }

    const hasRole = requiredRoles.includes(
      user.role,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}

