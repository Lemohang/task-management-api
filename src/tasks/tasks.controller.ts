
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  // =========================
  // GET ALL TASKS
  // =========================

  @UseGuards(JwtAuthGuard)
  @Get()
  getTasks(@Query() query: TaskQueryDto) {
    return this.tasksService.getTasks(
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

  @Get('stats')
  getTaskStats() {
    return this.tasksService.getTaskStats();
  }

  // =========================
  // GET MY TASKS
  // =========================

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyTasks(
    @Req() req: Request & {
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

  @Get(':id')
  getTaskById(
    @Param('id') id: string,
  ) {
    return this.tasksService.getTaskById(
      Number(id),
    );
  }

  // =========================
  // CREATE TASK
  // =========================

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

  @Patch(':id')
  updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(
      Number(id),
      updateTaskDto,
    );
  }

  // =========================
  // DELETE TASK
  // =========================

  @Delete(':id')
  deleteTask(
    @Param('id') id: string,
  ) {
    return this.tasksService.deleteTask(
      Number(id),
    );
  }
}
