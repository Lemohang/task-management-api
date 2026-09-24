import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/user-role.enum.js';

export const Roles = (...roles: UserRole[]) =>
  SetMetadata('roles', roles);