import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';
import { User } from '../users/user.entity.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),

    ConfigModule,

    PassportModule.register({
    defaultStrategy: 'jwt',
  }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
  ],

  controllers: [AuthController],

 providers: [
  AuthService,
  JwtStrategy,
  JwtAuthGuard,
],

  exports: [
    PassportModule,
    JwtModule,
    JwtAuthGuard,
  ],
})
export class AuthModule {}