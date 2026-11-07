import 'dotenv/config';
import * as path from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression = require('compression');
import cookieParser = require('cookie-parser');

import { AppModule } from './app.module';
import {
  ENV_CONFIG,
  EnvConfig,
  loadEnvConfig,
  logConfigSummary,
} from './common/config/env.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  // Konfiguratsiya NestFactory dan OLDIN tekshiriladi — noto'g'ri sozlamada
  // yarim ishga tushgan server o'rniga darhol tushunarli xato beramiz.
  let config: EnvConfig;
  try {
    config = loadEnvConfig();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Ishlab chiqarishda debug/verbose loglar o'chiriladi.
    logger: config.isProduction
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // ── Xavfsizlik sarlavhalari ──
  app.use(
    helmet({
      // Telegram WebApp sahifani iframe ichida ochadi, shuning uchun
      // COEP/CORP standart qiymatlari mos kelmaydi.
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: config.isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'blob:'],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              frameAncestors: ["'self'", 'https://web.telegram.org'],
              objectSrc: ["'none'"],
              upgradeInsecureRequests: [],
            },
          }
        : false,
      hsts: config.isProduction
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
        : false,
    }),
  );

  app.use(compression());
  app.use(cookieParser());

  // Reverse proxy ortida ishlaganda haqiqiy mijoz IP sini olish uchun —
  // tezlik cheklovlari shunga tayanadi.
  app.set('trust proxy', 1);

  app.enableCors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      // Telegram WebApp va checkout oqimlari uchun.
      'X-Telegram-Init-Data',
      'X-Idempotency-Key',
      'X-Request-Id',
    ],
    credentials: true,
    maxAge: 86_400,
  });

  app.setGlobalPrefix('api');

  // Yuklangan fayllar. immutable — fayl nomlari UUID, mazmuni o'zgarmaydi.
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
    maxAge: '30d',
    immutable: true,
    index: false,
    dotfiles: 'deny',
    setHeaders: (res, filePath) => {
      // MIME-sniffingni to'sish — brauzer Content-Type ni o'zgartira olmaydi.
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // Yuklangan fayllar (ayniqsa SVG) faol kontent tashiy olmasligi kerak.
      // Bu sarlavha to'g'ridan-to'g'ri ochilgan SVG ichidagi skript/obyektni
      // bloklaydi; <img> orqali render qilishga ta'sir qilmaydi.
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; script-src 'none'; object-src 'none'; sandbox",
      );
      // SVG faqat rasm sifatida yuklanadi — inline ochilsa ham xavfsiz.
      if (filePath.toLowerCase().endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    },
  });

  // Filtrlar teskari tartibda qo'llanadi: aniqrog'i (Prisma) oldin ishlaydi,
  // qolganini universal filtr ushlaydi.
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get<EnvConfig>(ENV_CONFIG)),
    new PrismaExceptionFilter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      // Ishlab chiqarishda tekshiruv xatolari ichki DTO tuzilishini
      // ochib bermasligi kerak.
      disableErrorMessages: false,
      validationError: { target: false, value: false },
    }),
  );

  app.enableShutdownHooks();

  // ── Swagger ──
  if (config.SWAGGER_ENABLED && !config.isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Zahabi Parfume API')
      .setDescription(
        'Zahabi Parfume — premium parfyumeriya do\'koni API. ' +
          'Brauzer va Telegram WebApp bir xil endpointlardan foydalanadi.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(config.PORT);

  logConfigSummary(config, logger);
  logger.log(`API: http://localhost:${config.PORT}/api`);
  if (config.SWAGGER_ENABLED && !config.isProduction) {
    logger.log(`Swagger: http://localhost:${config.PORT}/api/docs`);
  }
}

void bootstrap();
