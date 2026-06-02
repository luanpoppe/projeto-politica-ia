import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { EnvService } from '../../../../core/env.service';
import {
  generateOpaqueToken,
  hashToken,
} from '../../../../shared/utils/token.util';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../users/domain/repositories/user.repository.interface';
import {
  IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '../../domain/repositories/refresh-token.repository.interface';
import { AuthTokensResponse } from '../types/auth-tokens.response';

export type RefreshTokenInput = {
  refreshToken: string;
};

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<AuthTokensResponse> {
    const env = this.envService.getEnvs();
    const oldTokenHash = hashToken(input.refreshToken);
    const userId =
      await this.refreshTokenRepository.findUserIdByTokenHash(oldTokenHash);

    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    const newRefreshToken = generateOpaqueToken();
    const newTokenHash = hashToken(newRefreshToken);

    const replaced = await this.refreshTokenRepository.replace(
      oldTokenHash,
      newTokenHash,
      userId,
      env.JWT_REFRESH_EXPIRES_IN_SECONDS,
    );

    if (!replaced) {
      throw new UnauthorizedException();
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: env.JWT_ACCESS_SECRET,
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as JwtSignOptions['expiresIn'],
      },
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }
}
