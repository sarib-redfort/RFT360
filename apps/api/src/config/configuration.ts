import { z } from 'zod';

/**
 * Environment schema.
 *
 * Validated once at boot by {@link validateEnv}; the process refuses to start if
 * anything required is missing or malformed. This turns "works on my machine"
 * config drift into an immediate, readable failure.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Server
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('api'),
  API_URL: z.string().url().default('http://localhost:4000'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().url().or(z.string().startsWith('postgres')),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Rate limiting
  THROTTLE_TTL: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),

  // Revalidation webhook -> Next.js
  REVALIDATE_SECRET: z.string().min(8),
  WEB_URL: z.string().url().default('http://localhost:3000'),

  // Storage
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('./uploads'),
  STORAGE_PUBLIC_URL: z.string().default('http://localhost:4000/uploads'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(10),

  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('auto'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(false),

  // Email
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().default('RFT360 <noreply@redfort360.com>'),
  MAIL_NOTIFY_TO: z.string().default('careers@redfort360.com'),

  // Seed
  SEED_ADMIN_EMAIL: z.string().email().default('admin@redfort360.com'),
  SEED_ADMIN_PASSWORD: z.string().default('ChangeMe123!'),
  SEED_ADMIN_NAME: z.string().default('RFT360 Administrator'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parses and validates `process.env`, throwing a readable aggregate error if
 * validation fails. Wired into `ConfigModule.forRoot({ validate })`.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  /*
   * Refuse to boot in production with the placeholder secrets from
   * `.env.example`. These are public (committed to the repo), so shipping with
   * them would let anyone mint valid tokens. Failing at startup is far safer
   * than running a compromised deployment.
   */
  if (parsed.data.NODE_ENV === 'production') {
    const placeholders = (
      [
        ['JWT_SECRET', parsed.data.JWT_SECRET],
        ['JWT_REFRESH_SECRET', parsed.data.JWT_REFRESH_SECRET],
        ['REVALIDATE_SECRET', parsed.data.REVALIDATE_SECRET],
      ] as const
    ).filter(([, value]) => value.includes('change-me'));

    if (placeholders.length > 0) {
      throw new Error(
        `Refusing to start in production with placeholder secrets: ` +
          `${placeholders.map(([key]) => key).join(', ')}. Generate real values with ` +
          `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`,
      );
    }

    if (parsed.data.SEED_ADMIN_PASSWORD === 'ChangeMe123!') {
      throw new Error(
        'Refusing to start in production with the default SEED_ADMIN_PASSWORD. Set a real one.',
      );
    }

    // Uploads on a local disk vanish on every deploy for container/serverless
    // hosts. Warn loudly rather than silently losing media.
    if (parsed.data.STORAGE_DRIVER === 'local') {
      console.warn(
        '[config] STORAGE_DRIVER=local in production — uploaded media is stored on the ' +
          'container filesystem and will be LOST on redeploy unless a persistent volume ' +
          'is mounted at STORAGE_LOCAL_PATH. Use STORAGE_DRIVER=s3 for ephemeral hosts.',
      );
    }
  }

  if (parsed.data.STORAGE_DRIVER === 's3') {
    const missing = (['S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const).filter(
      (key) => !parsed.data[key],
    );
    if (missing.length > 0) {
      throw new Error(
        `STORAGE_DRIVER=s3 requires: ${missing.join(', ')}. Set them or use STORAGE_DRIVER=local.`,
      );
    }
  }

  return parsed.data;
}

/**
 * Strongly-typed accessor for `ConfigService`. Groups the flat env into nested
 * objects so callers read `config.get('jwt.secret')` instead of raw keys.
 */
export function configFactory() {
  const env = validateEnv(process.env);
  const corsOrigins = env.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    server: {
      port: env.API_PORT,
      prefix: env.API_PREFIX,
      url: env.API_URL,
      corsOrigins,
    },
    database: { url: env.DATABASE_URL },
    redis: { url: env.REDIS_URL },
    jwt: {
      secret: env.JWT_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
    throttle: { ttl: env.THROTTLE_TTL, limit: env.THROTTLE_LIMIT },
    revalidate: { secret: env.REVALIDATE_SECRET, webUrl: env.WEB_URL },
    storage: {
      driver: env.STORAGE_DRIVER,
      localPath: env.STORAGE_LOCAL_PATH,
      publicUrl: env.STORAGE_PUBLIC_URL,
      maxUploadBytes: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
      s3: {
        endpoint: env.S3_ENDPOINT,
        region: env.S3_REGION,
        bucket: env.S3_BUCKET,
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        publicUrl: env.S3_PUBLIC_URL,
        forcePathStyle: env.S3_FORCE_PATH_STYLE,
      },
    },
    mail: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
      from: env.MAIL_FROM,
      notifyTo: env.MAIL_NOTIFY_TO,
    },
    seed: {
      adminEmail: env.SEED_ADMIN_EMAIL,
      adminPassword: env.SEED_ADMIN_PASSWORD,
      adminName: env.SEED_ADMIN_NAME,
    },
  };
}

export type AppConfig = ReturnType<typeof configFactory>;
