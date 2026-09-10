import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  updateTask(id: number, updateTaskDto: UpdateTaskDto) {
  const taskIndex = this.tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    throw new NotFoundException(`Task with ID ${id} not found`);
  }

  this.tasks[taskIndex] = {
    ...this.tasks[taskIndex],
    ...updateTaskDto,
  };

  return this.tasks[taskIndex];
}
  private tasks = [
    {
      id: 1,
      title: 'Learn NestJS',
      completed: false,
    },
    {
      id: 2,
      title: 'Build Task Management API',
      completed: false,
    },
  ];

  getTasks() {
    return this.tasks;
  }

  createTask(createTaskDto: CreateTaskDto) {
  const newId =
    this.tasks.length > 0
      ? Math.max(...this.tasks.map((task) => task.id)) + 1
      : 1;

  const task = {
    id: newId,
    ...createTaskDto,
    completed: false,
  };

  this.tasks.push(task);

  return task;
}

 getTaskById(id: number) {
  const task = this.tasks.find((task) => task.id === id);

  if (!task) {
    throw new NotFoundException(`Task with ID ${id} not found`);
  }

  return task;
}
deleteTask(id: number) {
  const taskIndex = this.tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    throw new NotFoundException(`Task with ID ${id} not found`);
  }

  const deletedTask = this.tasks[taskIndex];

  this.tasks.splice(taskIndex, 1);

  return deletedTask;
}
}