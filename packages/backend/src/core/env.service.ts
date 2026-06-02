import { Injectable } from '@nestjs/common';
import z from 'zod';
import { parseDurationToSeconds } from '../shared/utils/duration.util';

const envSchema = z.object({
  PORT: z.coerce.number().default(3011),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
});

export type AppEnv = z.infer<typeof envSchema> & {
  JWT_REFRESH_EXPIRES_IN_SECONDS: number;
};

@Injectable()
export class EnvService {
  private cached?: AppEnv;

  getEnvs(): AppEnv {
    if (this.cached) {
      return this.cached;
    }

    const { data, error } = envSchema.safeParse(process.env);
    if (error) {
      throw new Error(`Invalid env vars: ${error.message}`);
    }

    this.cached = {
      ...data,
      JWT_REFRESH_EXPIRES_IN_SECONDS: parseDurationToSeconds(
        data.JWT_REFRESH_EXPIRES_IN,
      ),
    };

    return this.cached;
  }
}
