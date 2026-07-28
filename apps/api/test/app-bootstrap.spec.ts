import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { REDIS_CLIENT } from '../src/redis/redis.module';

/**
 * Boots the entire application module graph with the database and Redis mocked.
 *
 * This is a wiring test, not a behaviour test: `compile()` instantiates every
 * provider and controller across all 14 feature modules, so a missing module
 * import, an unexported provider, or a broken injection token fails here —
 * exactly the class of error that TypeScript cannot catch and that would
 * otherwise only surface at runtime bootstrap.
 */
describe('Application bootstrap (DI graph)', () => {
  // Minimal stand-ins so no real infra is touched.
  const prismaMock = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $on: jest.fn(),
  };
  const redisMock = {
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    pipeline: jest.fn(() => ({ sadd: jest.fn(), expire: jest.fn(), del: jest.fn(), exec: jest.fn() })),
    smembers: jest.fn().mockResolvedValue([]),
    quit: jest.fn(),
  };

  beforeAll(() => {
    // Provide the env the config validator requires.
    Object.assign(process.env, {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      JWT_SECRET: 'test-secret-at-least-16-chars-long',
      JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-16-chars',
      AUTH_SECRET: 'test-authjs-secret',
      REVALIDATE_SECRET: 'test-reval-secret',
    });
  });

  it('resolves every provider and controller', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(REDIS_CLIENT)
      .useValue(redisMock)
      .compile();

    expect(moduleRef).toBeDefined();

    // Instantiating the Nest app runs onModuleInit hooks against the mocks,
    // exercising the full lifecycle without real connections.
    const app = moduleRef.createNestApplication();
    await app.init();
    expect(app).toBeDefined();
    await app.close();
  });
});
