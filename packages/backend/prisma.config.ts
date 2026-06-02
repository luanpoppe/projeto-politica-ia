import { existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

const rootEnv = join(__dirname, '../../.env');
const rootExample = join(__dirname, '../../.env.example');

if (existsSync(rootEnv)) {
  config({ path: rootEnv });
} else if (existsSync(rootExample)) {
  config({ path: rootExample });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
