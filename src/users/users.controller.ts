import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { UsersService } from './users.service.js';

import { CreateUserDto } from './dto/create-user.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

import { AuthenticatedUser } from '../auth/authenticated-user.interface.js';
import { UserRole } from './user-role.enum.js';

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
  createUser(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id/tasks')
  getUserTasks(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.getUserTasks(id);
  }

  // User changes their own password
  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req()
    req: Request & {
      user: AuthenticatedUser;
    },
  ) {
    return this.usersService.changePassword(
      id,
      changePasswordDto,
      req.user,
    );
  }

  // Admin resets another user's password
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/password/reset')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req()
    req: Request & {
      user: AuthenticatedUser;
    },
  ) {
    return this.usersService.resetPassword(
      id,
      resetPasswordDto,
      req.user,
    );
  }
}