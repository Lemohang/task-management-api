import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { Type } from 'class-transformer';

import { TaskStatus } from '../task-status.enum.js';
import { TaskPriority } from '../task-priority.enum.js';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  assignedToId?: number;
}