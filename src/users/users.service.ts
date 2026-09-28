import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcryptjs';

import { User } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

import { Task } from '../tasks/task.entity.js';

import { AuthenticatedUser } from '../auth/authenticated-user.interface.js';
import { UserRole } from './user-role.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  // =========================
  // GET ALL USERS
  // =========================

  async getUsers() {
    const users = await this.userRepository.find({
      order: {
        id: 'ASC',
      },
    });

    return users.map(({ password, ...safeUser }) => safeUser);
  }

  // =========================
  // GET USER TASKS
  // =========================

  async getUserTasks(
    userId: number,
    currentUser: AuthenticatedUser,
  ) {
    // Normal users can only view their own tasks
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== userId
    ) {
      throw new ForbiddenException(
        'You can only view your own tasks',
      );
    }

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

  // =========================
  // CREATE USER
  // =========================

  async createUser(createUserDto: CreateUserDto) {
    const existingUser =
      await this.userRepository.findOne({
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
      role: createUserDto.role,
      isActive: true,
    });

    const savedUser =
      await this.userRepository.save(user);

    const {
      password,
      ...safeUser
    } = savedUser;

    return safeUser;
  }

  // =========================
  // UPDATE USER
  // =========================
  // ADMIN ONLY

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ) {
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

    // Check email uniqueness
    if (updateUserDto.email !== undefined) {
      const existingUser =
        await this.userRepository.findOne({
          where: {
            email: updateUserDto.email,
          },
        });

      if (
        existingUser &&
        existingUser.id !== userId
      ) {
        throw new ConflictException(
          'A user with this email already exists',
        );
      }

      user.email = updateUserDto.email;
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.role !== undefined) {
      user.role = updateUserDto.role;
    }

    const updatedUser =
      await this.userRepository.save(user);

    const {
      password,
      ...safeUser
    } = updatedUser;

    return safeUser;
  }

  // =========================
  // ACTIVATE / DEACTIVATE USER
  // =========================
  // ADMIN ONLY

  async updateUserStatus(
    userId: number,
    isActive: boolean,
  ) {
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

    user.isActive = isActive;

    const updatedUser =
      await this.userRepository.save(user);

    const {
      password,
      ...safeUser
    } = updatedUser;

    return safeUser;
  }

  // =========================
  // CHANGE OWN PASSWORD
  // =========================

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
    currentUser: AuthenticatedUser,
  ) {
    if (currentUser.id !== userId) {
      throw new ForbiddenException(
        'You can only change your own password',
      );
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', {
        id: userId,
      })
      .getOne();

    if (!user) {
      throw new NotFoundException(
        `User with ID ${userId} not found`,
      );
    }

    if (!user.password) {
      throw new BadRequestException(
        'This user does not have a password set',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Current password is incorrect',
      );
    }

    user.password = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    await this.userRepository.save(user);

    return {
      message: 'Password changed successfully',
    };
  }

  // =========================
  // ADMIN PASSWORD RESET
  // =========================

  async resetPassword(
    userId: number,
    resetPasswordDto: ResetPasswordDto,
    currentUser: AuthenticatedUser,
  ) {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only administrators can reset passwords',
      );
    }

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

    user.password = await bcrypt.hash(
      resetPasswordDto.newPassword,
      10,
    );

    await this.userRepository.save(user);

    return {
      message: 'Password reset successfully',
    };
  }
}