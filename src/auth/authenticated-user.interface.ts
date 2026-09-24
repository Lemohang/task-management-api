import { UserRole } from '../users/user-role.enum.js';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
}