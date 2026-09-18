import { Body, Controller, Delete, Get, Param, Patch, Post, Query} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

@Get()
getTasks(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('completed') completed?: string,
) {
  return this.tasksService.getTasks(
    page ? Number(page) : 1,
    limit ? Number(limit) : 10,
    completed !== undefined
      ? completed === 'true'
      : undefined,
  );
}
  @Get(':id')
  getTaskById(@Param('id') id: string) {
    return this.tasksService.getTaskById(Number(id));
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(createTaskDto);
  }

  @Patch(':id')
updateTask(
  @Param('id') id: string,
  @Body() updateTaskDto: UpdateTaskDto,
) {
  return this.tasksService.updateTask(Number(id), updateTaskDto);
}
@Delete(':id')
deleteTask(@Param('id') id: string) {
  return this.tasksService.deleteTask(Number(id));
}
}