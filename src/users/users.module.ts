import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

import { User } from './user.entity.js';
import { Task } from '../tasks/task.entity.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Task]),
    AuthModule,
  ],

  controllers: [UsersController],

  providers: [UsersService],
})
export class UsersModule {}