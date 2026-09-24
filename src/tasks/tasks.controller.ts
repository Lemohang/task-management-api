import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { TasksService } from './tasks.service.js';

import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskQueryDto } from './dto/task-query.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AuthenticatedUser } from '../auth/authenticated-user.interface.js';

import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  // =========================
  // GET TASKS
  // =========================
  // ADMIN → sees all tasks
  // USER  → sees only tasks assigned to them

  @UseGuards(JwtAuthGuard)
  @Get()
  getTasks(
    @Query() query: TaskQueryDto,
    @Req()
    req: Request & {
      user: AuthenticatedUser;
    },
  ) {
    return this.tasksService.getTasks(
      req.user,
      query.page ?? 1,
      query.limit ?? 10,
      query.status,
      query.priority,
      query.due,
      query.search,
      query.assignedTo,
    );
  }

  // =========================
  // GET TASK STATISTICS
  // =========================
  // ADMIN ONLY

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @Get('stats')
  getTaskStats() {
    return this.tasksService.getTaskStats();
  }

  // =========================
  // GET MY TASKS
  // =========================
  // Authenticated users only

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyTasks(
    @Req()
    req: Request & {
      user: AuthenticatedUser;
    },
  ) {
    return this.tasksService.getMyTasks(
      req.user.id,
    );
  }

  // =========================
  // GET TASK BY ID
  // =========================
  // ADMIN → can view any task
  // USER  → can only view their own task

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @Req()
    req: Request & {
      user: AuthenticatedUser;
    },
  ) {
    return this.tasksService.getTaskById(
      id,
      req.user,
    );
  }

  // =========================
  // CREATE TASK
  // =========================
  // ADMIN ONLY

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(
      createTaskDto,
    );
  }

  // =========================
  // UPDATE TASK
  // =========================
  // ADMIN → can update any task
  // USER  → can update their own task

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req()
    req: Request & {
      user: AuthenticatedUser;
    },
  ) {
    return this.tasksService.updateTask(
      id,
      updateTaskDto,
      req.user,
    );
  }

  // =========================
  // DELETE TASK
  // =========================
  // ADMIN ONLY

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  deleteTask(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tasksService.deleteTask(
      id,
    );
  }
}