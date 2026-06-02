import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const AUTH_TAG = 'auth';

export function ApiAuthTag() {
  return applyDecorators(ApiTags(AUTH_TAG));
}

export function ApiRegisterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Cadastrar novo usuário' }),
    ApiCreatedResponse({
      description: 'Usuário criado com sucesso',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          cpf: { type: 'string' },
          birthDate: { type: 'string', format: 'date' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiBadRequestResponse({ description: 'Dados inválidos' }),
    ApiConflictResponse({ description: 'E-mail ou CPF já cadastrado' }),
  );
}

export function ApiLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Autenticar usuário' }),
    ApiOkResponse({
      description: 'Tokens emitidos com sucesso',
      schema: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'string' },
        },
      },
    }),
    ApiBadRequestResponse({ description: 'Dados inválidos' }),
    ApiUnauthorizedResponse({ description: 'Credenciais inválidas' }),
  );
}

export function ApiRefreshDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Renovar tokens (rotação obrigatória)' }),
    ApiOkResponse({
      description: 'Novo par de tokens emitido',
      schema: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'string' },
        },
      },
    }),
    ApiBadRequestResponse({ description: 'Dados inválidos' }),
    ApiUnauthorizedResponse({ description: 'Refresh token inválido ou expirado' }),
  );
}

export function ApiLogoutDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Encerrar sessão (revoga todos os refresh tokens do usuário)',
    }),
    ApiNoContentResponse({ description: 'Logout realizado com sucesso' }),
    ApiBadRequestResponse({ description: 'Dados inválidos' }),
    ApiUnauthorizedResponse({ description: 'Access token inválido ou ausente' }),
  );
}
