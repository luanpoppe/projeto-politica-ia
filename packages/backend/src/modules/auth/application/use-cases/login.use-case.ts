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
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '../../domain/services/password-hasher.interface';
import { AuthTokensResponse } from '../types/auth-tokens.response';

export type LoginInput = {
  email: string;
  password: string;
};

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
  ) {}

  async execute(input: LoginInput): Promise<AuthTokensResponse> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.issueTokens(user.id, user.email);
  }

  private async issueTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokensResponse> {
    const env = this.envService.getEnvs();
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: env.JWT_ACCESS_SECRET,
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as JwtSignOptions['expiresIn'],
      },
    );

    const refreshToken = generateOpaqueToken();
    const refreshTokenHash = hashToken(refreshToken);

    await this.refreshTokenRepository.store(
      userId,
      refreshTokenHash,
      env.JWT_REFRESH_EXPIRES_IN_SECONDS,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }
}
