import { DocumentBuilder } from '@nestjs/swagger';

export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Projeto Política IA API')
    .setDescription('Documentação da API do Projeto Política IA')
    .setVersion('1.0')
    .addTag('api')
    .addTag('auth')
    .addBearerAuth()
    .build();
}
