import {
  ValidationPipe,
} from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';

import { AppModule } from './app.module.js';

async function bootstrap() {
 

  const app =
    await NestFactory.create(AppModule);

  // =========================
  // SECURITY HEADERS
  // =========================

  app.use(
    helmet(),
  );

  // =========================
  // CORS
  // =========================

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://mplug.com.ls',
    ],
    methods: [
      'GET',
      'POST',
      'PATCH',
      'PUT',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
    credentials: true,
  });

  // =========================
  // VALIDATION
  // =========================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // =========================
  // START SERVER
  // =========================

  await app.listen(
    process.env.PORT ?? 3001,
  );
}

bootstrap();