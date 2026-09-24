import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './task.entity.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskDue } from './task-due.enum.js';
import { TaskStatus } from './task-status.enum.js';
import { TaskPriority } from './task-priority.enum.js';

import { User } from '../users/user.entity.js';
import { UserRole } from '../users/user-role.enum.js';

import { AuthenticatedUser } from '../auth/authenticated-user.interface.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // =========================
  // GET TASKS
  // =========================
  async getTasks(
    currentUser: AuthenticatedUser,
    page = 1,
    limit = 10,
    status?: string,
    priority?: string,
    due?: TaskDue,
    search?: string,
    assignedTo?: number,
  ) {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect(
        'task.assignedTo',
        'assignedTo',
      )
      .addSelect([
        'assignedTo.id',
        'assignedTo.name',
        'assignedTo.email',
        'assignedTo.createdAt',
        'assignedTo.updatedAt',
      ]);

    // =========================
    // AUTHORIZATION
    // =========================
    // ADMIN can see all tasks.
    // USER can only see tasks assigned to them.
    if (currentUser.role !== UserRole.ADMIN) {
      query.where(
        'task.assignedToId = :userId',
        {
          userId: currentUser.id,
        },
      );
    }

    // =========================
    // FILTER BY STATUS
    // =========================
    if (status !== undefined) {
      query.andWhere(
        'task.status = :status',
        {
          status,
        },
      );
    }

    // =========================
    // FILTER BY PRIORITY
    // =========================
    if (priority !== undefined) {
      query.andWhere(
        'task.priority = :priority',
        {
          priority,
        },
      );
    }

    // =========================
    // SEARCH TITLE & DESCRIPTION
    // =========================
    if (search !== undefined) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    // =========================
    // FILTER BY ASSIGNED USER
    // =========================
    if (assignedTo !== undefined) {
      query.andWhere(
        'task.assignedToId = :assignedTo',
        {
          assignedTo,
        },
      );
    }

    // =========================
    // OVERDUE TASKS
    // =========================
    if (due === TaskDue.OVERDUE) {
      query.andWhere(
        'task.dueDate IS NOT NULL AND task.dueDate < NOW()',
      );
    }

    // =========================
    // TASKS DUE TODAY
    // =========================
    if (due === TaskDue.TODAY) {
      const startOfDay = new Date();

      startOfDay.setHours(
        0,
        0,
        0,
        0,
      );

      const startOfTomorrow =
        new Date(startOfDay);

      startOfTomorrow.setDate(
        startOfTomorrow.getDate() + 1,
      );

      query.andWhere(
        'task.dueDate IS NOT NULL AND task.dueDate >= :startOfDay AND task.dueDate < :startOfTomorrow',
        {
          startOfDay,
          startOfTomorrow,
        },
      );
    }

    // =========================
    // UPCOMING TASKS
    // =========================
    if (due === TaskDue.UPCOMING) {
      const startOfTomorrow =
        new Date();

      startOfTomorrow.setHours(
        0,
        0,
        0,
        0,
      );

      startOfTomorrow.setDate(
        startOfTomorrow.getDate() + 1,
      );

      query.andWhere(
        'task.dueDate IS NOT NULL AND task.dueDate >= :startOfTomorrow',
        {
          startOfTomorrow,
        },
      );
    }

    // =========================
    // PAGINATION & SORTING
    // =========================
    query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(
        'task.createdAt',
        'DESC',
      );

    const [tasks, total] =
      await query.getManyAndCount();

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit,
        ),
      },
    };
  }

  // =========================
  // GET MY TASKS
  // =========================
  async getMyTasks(
    userId: number,
  ) {
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect(
        'task.assignedTo',
        'assignedTo',
      )
      .addSelect([
        'assignedTo.id',
        'assignedTo.name',
        'assignedTo.email',
        'assignedTo.createdAt',
        'assignedTo.updatedAt',
      ])
      .where(
        'task.assignedToId = :userId',
        {
          userId,
        },
      )
      .orderBy(
        'task.createdAt',
        'DESC',
      )
      .getMany();
  }

  // =========================
  // TASK STATISTICS
  // =========================
  async getTaskStats() {
    const total =
      await this.taskRepository.count();

    const todo =
      await this.taskRepository.count({
        where: {
          status: TaskStatus.TODO,
        },
      });

    const inProgress =
      await this.taskRepository.count({
        where: {
          status: TaskStatus.IN_PROGRESS,
        },
      });

    const completed =
      await this.taskRepository.count({
        where: {
          status: TaskStatus.COMPLETED,
        },
      });

    const cancelled =
      await this.taskRepository.count({
        where: {
          status: TaskStatus.CANCELLED,
        },
      });

    const highPriority =
      await this.taskRepository.count({
        where: {
          priority: TaskPriority.HIGH,
        },
      });

    const urgentPriority =
      await this.taskRepository.count({
        where: {
          priority: TaskPriority.URGENT,
        },
      });

    const overdue =
      await this.taskRepository
        .createQueryBuilder('task')
        .where(
          'task.dueDate IS NOT NULL',
        )
        .andWhere(
          'task.dueDate < NOW()',
        )
        .andWhere(
          'task.status != :completed',
          {
            completed:
              TaskStatus.COMPLETED,
          },
        )
        .andWhere(
          'task.status != :cancelled',
          {
            cancelled:
              TaskStatus.CANCELLED,
          },
        )
        .getCount();

    return {
      total,
      todo,
      inProgress,
      completed,
      cancelled,
      highPriority,
      urgentPriority,
      overdue,
    };
  }

  // =========================
  // GET TASK BY ID
  // =========================
  async getTaskById(
    id: number,
    currentUser: AuthenticatedUser,
  ) {
    const task =
      await this.taskRepository.findOne({
        where: {
          id,
        },
        relations: {
          assignedTo: true,
        },
      });

    if (!task) {
      throw new NotFoundException(
        `Task with ID ${id} not found`,
      );
    }

    // ADMIN can view any task.
    // USER can only view tasks assigned to them.
    if (
      currentUser.role !== UserRole.ADMIN &&
      task.assignedTo?.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You can only view tasks assigned to you',
      );
    }

    return task;
  }

  // =========================
  // CREATE TASK
  // =========================
  async createTask(
    createTaskDto: CreateTaskDto,
  ) {
    const {
      assignedToId,
      ...taskData
    } = createTaskDto;

    let assignedUser:
      | User
      | null = null;

    if (
      assignedToId !== undefined
    ) {
      assignedUser =
        await this.userRepository.findOne(
          {
            where: {
              id: assignedToId,
            },
          },
        );

      if (!assignedUser) {
        throw new NotFoundException(
          `User with ID ${assignedToId} not found`,
        );
      }
    }

    const task =
      this.taskRepository.create({
        ...taskData,
        assignedTo: assignedUser,
      });

    return this.taskRepository.save(
      task,
    );
  }

  // =========================
  // UPDATE TASK
  // =========================
  async updateTask(
    id: number,
    updateTaskDto: UpdateTaskDto,
    currentUser: AuthenticatedUser,
  ) {
    const task =
      await this.getTaskById(
        id,
        currentUser,
      );

    // ADMIN can update any task.
    // USER can only update their own assigned task.
    if (
      currentUser.role !== UserRole.ADMIN &&
      task.assignedTo?.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You can only update tasks assigned to you',
      );
    }

    const {
      assignedToId,
      ...taskData
    } = updateTaskDto;

    Object.assign(
      task,
      taskData,
    );

    // =========================
    // REASSIGN TASK
    // =========================
    // Only ADMIN can reassign tasks.
    if (
      assignedToId !== undefined
    ) {
      if (
        currentUser.role !==
        UserRole.ADMIN
      ) {
        throw new ForbiddenException(
          'Only administrators can assign tasks',
        );
      }

      const assignedUser =
        await this.userRepository.findOne(
          {
            where: {
              id: assignedToId,
            },
          },
        );

      if (!assignedUser) {
        throw new NotFoundException(
          `User with ID ${assignedToId} not found`,
        );
      }

      task.assignedTo =
        assignedUser;
    }

    return this.taskRepository.save(
      task,
    );
  }

  // =========================
  // DELETE TASK
  // =========================
  async deleteTask(
    id: number,
  ) {
    const task =
      await this.taskRepository.findOne({
        where: {
          id,
        },
        relations: {
          assignedTo: true,
        },
      });

    if (!task) {
      throw new NotFoundException(
        `Task with ID ${id} not found`,
      );
    }

    await this.taskRepository.remove(
      task,
    );

    return task;
  }
}