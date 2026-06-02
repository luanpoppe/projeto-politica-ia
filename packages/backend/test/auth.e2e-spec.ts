import { existsSync } from 'fs';
import { join } from 'path';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { RedisService } from '../src/shared/infrastructure/redis/redis.service';

const hasDevEnv = existsSync(join(__dirname, '../../../.env'));
const describeIfEnv = hasDevEnv ? describe : describe.skip;

describeIfEnv('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;

  const validUser = {
    name: 'Usuário Teste',
    email: `test-${Date.now()}@example.com`,
    cpf: '52998224725',
    birthDate: '1990-01-15',
    password: 'senha1234',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
    redis = app.get(RedisService);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await redis.getClient().flushdb();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register — cadastra usuário', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validUser)
      .expect(201);

    expect(response.body).toMatchObject({
      name: validUser.name,
      email: validUser.email,
      cpf: validUser.cpf,
      birthDate: validUser.birthDate,
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
  });

  it('POST /auth/login — emite tokens', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(validUser);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: validUser.email, password: validUser.password })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.expiresIn).toBeDefined();
  });

  it('POST /auth/refresh — rotaciona refresh token', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(validUser);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: validUser.email, password: validUser.password })
      .expect(200);

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(200);

    expect(refresh.body.accessToken).toBeDefined();
    expect(refresh.body.refreshToken).not.toBe(login.body.refreshToken);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(401);
  });

  it('POST /auth/logout — revoga todas as sessões', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(validUser);

    const loginA = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: validUser.email, password: validUser.password })
      .expect(200);

    const loginB = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: validUser.email, password: validUser.password })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${loginA.body.accessToken}`)
      .send({ refreshToken: loginA.body.refreshToken })
      .expect(204);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginA.body.refreshToken })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginB.body.refreshToken })
      .expect(401);
  });
});
