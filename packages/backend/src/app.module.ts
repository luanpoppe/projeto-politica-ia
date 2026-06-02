import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedInfrastructureModule } from './shared/infrastructure/shared-infrastructure.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '../../../.env'),
    }),
    CoreModule,
    SharedInfrastructureModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
