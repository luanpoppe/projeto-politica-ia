import { existsSync } from 'fs';
import { join } from 'path';
import { config as loadEnv } from 'dotenv';

const rootDir = join(__dirname, '../../..');
const envPath = join(rootDir, '.env');
const examplePath = join(rootDir, '.env.example');

if (existsSync(envPath)) {
  loadEnv({ path: envPath });
} else if (existsSync(examplePath)) {
  loadEnv({ path: examplePath });
}
