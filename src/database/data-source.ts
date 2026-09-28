import 'dotenv/config';

import { DataSource } from 'typeorm';

import { User } from '../users/user.entity.js';
import { Task } from '../tasks/task.entity.js';

export default new DataSource({
  type: 'postgres',

  url: process.env.DATABASE_URL,

  entities: [
    User,
    Task,
  ],

  migrations: [
    'src/database/migrations/*.ts',
  ],

  synchronize: false,
});