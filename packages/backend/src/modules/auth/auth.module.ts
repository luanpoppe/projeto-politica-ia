import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { EnvService } from '../../core/env.service';
import { SharedInfrastructureModule } from '../../shared/infrastructure/shared-infrastructure.module';
import { UsersModule } from '../users/users.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { REFRESH_TOKEN_REPOSITORY } from './domain/repositories/refresh-token.repository.interface';
import { PASSWORD_HASHER } from './domain/services/password-hasher.interface';
import { AuthController } from './infrastructure/http/auth.controller';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RedisRefreshTokenRepository } from './infrastructure/repositories/redis-refresh-token.repository';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';

@Module({
  imports: [
    SharedInfrastructureModule,
    UsersModule,
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => {
        const env = envService.getEnvs();
        const expiresIn = env.JWT_ACCESS_EXPIRES_IN as JwtSignOptions['expiresIn'];
        return {
          secret: env.JWT_ACCESS_SECRET,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    JwtAuthGuard,
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RedisRefreshTokenRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
  ],
})
export class AuthModule {}
