import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import {
  ThrottlerModule,
  ThrottlerGuard,
} from '@nestjs/throttler';

import {
  APP_GUARD,
} from '@nestjs/core';

import {
  createObserveModule,
} from '@nestjs/observe';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { TasksModule } from './tasks/tasks.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';

export const {
  ObserveModule,
  ObserveInstrument,
} =
  createObserveModule();

@Module({
  imports: [
    // =========================
    // ENVIRONMENT CONFIG
    // =========================

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // =========================
    // OBSERVE
    // =========================

    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'task-management-api',
    }),

    // =========================
    // RATE LIMITING
    // =========================

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // =========================
    // DATABASE
    // =========================

    TypeOrmModule.forRoot({
      type: 'postgres',

      url: process.env.DATABASE_URL,

      autoLoadEntities: true,

      // Database schema is managed explicitly.
      synchronize: false,
    }),

    // =========================
    // APPLICATION MODULES
    // =========================

    TasksModule,

    UsersModule,

    AuthModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,

    // =========================
    // GLOBAL RATE LIMIT GUARD
    // =========================

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}