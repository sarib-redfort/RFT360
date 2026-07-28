import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { LocalStorageDriver } from './modules/storage/drivers/local.driver';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  app.useLogger(app.get(PinoLogger));
  const logger = new Logger('Bootstrap');

  const prefix = config.get<string>('server.prefix', 'api');
  const corsOrigins = config.get<string[]>('server.corsOrigins', ['http://localhost:3000']);

  // Attach a request id for correlating logs with API error responses.
  app.use((req: { id?: string; headers: Record<string, unknown> }, _res: unknown, next: () => void) => {
    req.id = (req.headers['x-request-id'] as string) || randomUUID();
    next();
  });

  app.use(
    helmet({
      // The API serves JSON + uploaded media; a page-level CSP lives in the web app.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Global /api prefix + URI versioning -> routes live under /api/v1/*.
  app.setGlobalPrefix(prefix, { exclude: ['health', 'health/ready'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Serve locally-stored uploads when using the local driver.
  if (config.get<string>('storage.driver') === 'local') {
    const uploadsPath = join(process.cwd(), config.get<string>('storage.localPath', './uploads'));
    await LocalStorageDriver.ensureRoot(uploadsPath);
    app.useStaticAssets(uploadsPath, {
      prefix: '/uploads/',
      immutable: true,
      maxAge: '365d',
    });
  }

  app.enableShutdownHooks();

  // Swagger — API docs at /api/docs (dev + staging).
  if (config.get('env') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('RFT360 API')
      .setDescription('REST API for the RFT360 employer-branding platform and CMS')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth')
      .addTag('Public')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${prefix}/docs`, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = config.get<number>('server.port', 4000);
  await app.listen(port);

  logger.log(`RFT360 API running at http://localhost:${port}/${prefix}/v1`);
  if (config.get('env') !== 'production') {
    logger.log(`Swagger docs at http://localhost:${port}/${prefix}/docs`);
  }
}

void bootstrap();
