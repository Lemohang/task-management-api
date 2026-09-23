import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id/tasks')
  getUserTasks(@Param('id') id: string) {
    return this.usersService.getUserTasks(Number(id));
  }
}