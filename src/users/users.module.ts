import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { User } from './user.entity.js';
import { Task } from '../tasks/task.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}