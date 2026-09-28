import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import { ConfigService } from '@nestjs/config';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/user.entity.js';
import { UserRole } from '../users/user-role.enum.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    const secret =
      configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error(
        'JWT_SECRET is not configured',
      );
    }

    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: secret,
    });
  }

  // =========================
  // VALIDATE JWT
  // =========================

  async validate(payload: {
    sub: number;
    email: string;
    role: UserRole;
  }) {
    const user =
      await this.userRepository.findOne({
        where: {
          id: payload.sub,
        },
      });

    // User no longer exists
    if (!user) {
      throw new UnauthorizedException(
        'User account no longer exists',
      );
    }

    // User has been deactivated
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated',
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}