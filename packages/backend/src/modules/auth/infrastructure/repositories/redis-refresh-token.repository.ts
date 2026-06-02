import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../../shared/infrastructure/redis/redis.service';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';

@Injectable()
export class RedisRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly redisService: RedisService) {}

  private refreshKey(tokenHash: string): string {
    return `refresh:${tokenHash}`;
  }

  private userTokensKey(userId: string): string {
    return `user:${userId}:refresh_tokens`;
  }

  async store(
    userId: string,
    tokenHash: string,
    ttlSeconds: number,
  ): Promise<void> {
    const redis = this.redisService.getClient();
    const pipeline = redis.pipeline();
    pipeline.set(this.refreshKey(tokenHash), userId, 'EX', ttlSeconds);
    pipeline.sadd(this.userTokensKey(userId), tokenHash);
    await pipeline.exec();
  }

  async findUserIdByTokenHash(tokenHash: string): Promise<string | null> {
    const userId = await this.redisService
      .getClient()
      .get(this.refreshKey(tokenHash));
    return userId;
  }

  async replace(
    oldTokenHash: string,
    newTokenHash: string,
    userId: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const redis = this.redisService.getClient();
    const existingUserId = await redis.get(this.refreshKey(oldTokenHash));

    if (!existingUserId || existingUserId !== userId) {
      return false;
    }

    const pipeline = redis.pipeline();
    pipeline.del(this.refreshKey(oldTokenHash));
    pipeline.srem(this.userTokensKey(userId), oldTokenHash);
    pipeline.set(this.refreshKey(newTokenHash), userId, 'EX', ttlSeconds);
    pipeline.sadd(this.userTokensKey(userId), newTokenHash);
    await pipeline.exec();
    return true;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const redis = this.redisService.getClient();
    const tokenHashes = await redis.smembers(this.userTokensKey(userId));

    if (tokenHashes.length === 0) {
      return;
    }

    const pipeline = redis.pipeline();
    for (const tokenHash of tokenHashes) {
      pipeline.del(this.refreshKey(tokenHash));
    }
    pipeline.del(this.userTokensKey(userId));
    await pipeline.exec();
  }
}
