
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './task.entity.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

async getTasks(
  page = 1,
  limit = 10,
  completed?: boolean,
) {
  const query = this.taskRepository.createQueryBuilder('task');

  if (completed !== undefined) {
    query.where('task.completed = :completed', { completed });
  }

  query
    .skip((page - 1) * limit)
    .take(limit)
    .orderBy('task.createdAt', 'DESC');

  const [tasks, total] = await query.getManyAndCount();

  return {
    data: tasks,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
  async getTaskById(id: number) {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async createTask(createTaskDto: CreateTaskDto) {
    const task = this.taskRepository.create(createTaskDto);

    return this.taskRepository.save(task);
  }

  async updateTask(
    id: number,
    updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.getTaskById(id);

    Object.assign(task, updateTaskDto);

    return this.taskRepository.save(task);
  }

  async deleteTask(id: number) {
    const task = await this.getTaskById(id);

    await this.taskRepository.remove(task);

    return task;
  }
}
