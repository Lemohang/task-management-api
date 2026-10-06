
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
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
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

  // =========================
  // GET ALL USERS
  // =========================
  // ADMIN ONLY

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  // =========================
  // CREATE USER
  // =========================
  // ADMIN ONLY

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @Post()
  createUser(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.createUser(
      createUserDto,
    );
  }

  // =========================
  // UPDATE MY PROFILE
  // =========================
  // AUTHENTICATED USER ONLY
  //
  // Allows the logged-in user
  // to update their own name/email.

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyProfile(
    @Body()
    updateMyProfileDto: UpdateMyProfileDto,
    @Req()
    req: Request & {
      user: AuthenticatedUser;
    },
  ) {
    return this.usersService.updateMyProfile(
      req.user.id,
      updateMyProfileDto,
    );
  }

  // =========================
  // GET USER TASKS
  // =========================

  @UseGuards(JwtAuthGuard)
  @Get(':id/tasks')
  getUserTasks(
    @Param('id', ParseIntPipe) id: number,
    @Req()
    req: Request & {
      user: AuthenticatedUser;
    },
  ) {
    return this.usersService.getUserTasks(
      id,
      req.user,
    );
  }

  // =========================
  // UPDATE USER
  // =========================
  // ADMIN ONLY

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(
      id,
      updateUserDto,
    );
  }

  // =========================
  // ACTIVATE / DEACTIVATE USER
  // =========================
  // ADMIN ONLY

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(
      id,
      updateUserStatusDto.isActive,
    );
  }

  // =========================
  // CHANGE OWN PASSWORD
  // =========================

  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    changePasswordDto: ChangePasswordDto,
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

  // =========================
  // ADMIN PASSWORD RESET
  // =========================

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @Patch(':id/password/reset')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    resetPasswordDto: ResetPasswordDto,
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
