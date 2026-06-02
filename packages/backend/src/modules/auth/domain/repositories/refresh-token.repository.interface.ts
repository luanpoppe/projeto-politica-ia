export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');

export interface IRefreshTokenRepository {
  store(userId: string, tokenHash: string, ttlSeconds: number): Promise<void>;
  findUserIdByTokenHash(tokenHash: string): Promise<string | null>;
  replace(
    oldTokenHash: string,
    newTokenHash: string,
    userId: string,
    ttlSeconds: number,
  ): Promise<boolean>;
  revokeAllForUser(userId: string): Promise<void>;
}
