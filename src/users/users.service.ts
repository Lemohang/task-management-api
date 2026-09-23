import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { Task } from '../tasks/task.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async getUsers() {
    const users = await this.userRepository.find({
      order: {
        id: 'ASC',
      },
    });

    return users.map(({ password, ...safeUser }) => safeUser);
  }

  async getUserTasks(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${userId} not found`,
      );
    }

    return this.taskRepository.find({
      where: {
        assignedTo: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'A user with this email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      10,
    );

    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const { password, ...safeUser } = savedUser;

    return safeUser;
  }
}