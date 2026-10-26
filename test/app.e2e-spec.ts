import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

/**
 * E2E smoke test del endpoint raíz.
 *
 * Se ejecuta con `pnpm run test:e2e`. NO importa el `AppModule` para no
 * forzar una conexión a Postgres ni arrastrar `TypeOrmModule.forFeature`,
 * que requieren un `DataSource` activo.
 */
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(process.env.GLOBAL_PREFIX ?? 'api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/v1 (root) returns service status', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          service: 'suggestion-api',
          docs: '/docs',
        });
      });
  });

  it('GET /api/v1/unknown should 404 (route does not exist)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/unknown')
      .expect(404);
  });
});