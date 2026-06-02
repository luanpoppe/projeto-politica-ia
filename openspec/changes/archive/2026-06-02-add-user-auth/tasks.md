## Notas para implementação (`/opsx:apply`)

> **Importante — Docker e `.env`**
>
> - Criar **apenas** `.env.example` — **não** criar `.env` automaticamente.
> - **Não** executar `docker compose up -d` durante a geração inicial de arquivos.
> - Portas padrão no `.env.example`: `POSTGRES_PORT=6015`, `REDIS_PORT=6016` (livres na máquina do dev).
> - O desenvolvedor copia `.env.example` → `.env` e ajusta portas se necessário.
> - **Depois** do `.env` confirmado, rodar Docker e migrations (tarefas 9.x abaixo).

## 1. Infraestrutura e dependências

- [x] 1.1 Adicionar dependências no backend: `@prisma/client`, `prisma`, `@nestjs/jwt`, `bcrypt`, `ioredis` e tipos (`@types/bcrypt`) — **sem** Passport
- [x] 1.2 Criar `docker-compose.yml` na raiz com PostgreSQL e Redis; portas via `POSTGRES_PORT` e `REDIS_PORT` do `.env`
- [x] 1.3 Criar **`.env.example`** na raiz (portas `6015` / `6016`; `PORT=3011`; JWT, `DATABASE_URL`, `REDIS_URL`) — **não** criar `.env`
- [x] 1.4 Configurar backend para carregar o `.env` da raiz do monorepo
- [x] 1.5 Estender `EnvService` com validação Zod das novas variáveis de ambiente

## 2. Infraestrutura compartilhada (`shared/infrastructure/`)

- [x] 2.1 Criar `SharedInfrastructureModule` com `PrismaService` e `RedisService` (clients técnicos, não-domínio)
- [x] 2.2 Inicializar Prisma (`prisma/schema.prisma`) com modelo `User` e scripts `db:*`

## 3. Módulo `users` (Clean Architecture + DDD)

- [x] 3.1 **Domain:** criar entidade `User` em `modules/users/domain/entities/`
- [x] 3.2 **Domain:** definir interface `IUserRepository` (port) em `modules/users/domain/repositories/`
- [x] 3.3 **Infrastructure:** implementar `PrismaUserRepository` em `modules/users/infrastructure/repositories/`
- [x] 3.4 Registrar port → adapter no `UsersModule` (`USER_REPOSITORY` → `PrismaUserRepository`)
- [x] 3.5 Exportar `USER_REPOSITORY` para consumo pelo módulo `auth`

## 4. Módulo `auth` — domain e infrastructure

- [x] 4.1 **Domain:** definir interface `IRefreshTokenRepository` (port) em `modules/auth/domain/repositories/`
- [x] 4.2 **Infrastructure:** implementar `RedisRefreshTokenRepository` (TTL, rotação, revogação, índice `user:{userId}:refresh_tokens`)
- [x] 4.3 **Infrastructure:** implementar `BcryptPasswordHasher` em `modules/auth/infrastructure/services/`
- [x] 4.4 **Infrastructure:** criar `JwtAuthGuard` (`CanActivate` + `JwtService.verifyAsync`) — sem Passport
- [x] 4.5 Registrar ports → adapters no `AuthModule`

## 5. Módulo `auth` — application (use cases)

- [x] 5.1 Configurar `JwtModule` no `AuthModule` com secret e expiração via `EnvService`
- [x] 5.2 Implementar `RegisterUseCase` (valida unicidade, hasheia senha, persiste via `IUserRepository`)
- [x] 5.3 Implementar `LoginUseCase` (valida credenciais, emite JWT + refresh token)
- [x] 5.4 Implementar `RefreshTokenUseCase` (rotação obrigatória: invalida anterior, emite novo par)
- [x] 5.5 Implementar `LogoutUseCase` (revoga **todos** os refresh tokens ativos do usuário via `IRefreshTokenRepository`)
- [x] 5.6 Garantir que use cases dependem apenas de **interfaces** do domain, nunca de Prisma/Redis diretamente

## 6. Módulo `auth` — adaptador HTTP (`infrastructure/http/`)

- [x] 6.1 Criar DTOs Zod em `infrastructure/http/dto/`: `RegisterDto`, `LoginDto`, `RefreshTokenDto`, `LogoutDto`
- [x] 6.2 Criar metadados Swagger do módulo auth em `infrastructure/http/swagger/` (tags, `@ApiOperation`, `@ApiResponse`, schemas de resposta)
- [x] 6.3 Criar `AuthController` em `infrastructure/http/` com decorators Swagger, delegando para use cases
- [x] 6.4 Registrar `AuthModule` (importando `SharedInfrastructureModule` e `UsersModule`) em `AppModule`
- [x] 6.5 Remover DTO placeholder `create-user.dto.ts` se não for mais utilizado

## 7. Documentação e qualidade

- [x] 7.1 Garantir respostas de erro consistentes (400, 401, 409)
- [x] 7.2 Escrever testes e2e: register, login, refresh com rotação, reuso de token, logout revogando todas as sessões
- [x] 7.3 Validar fluxo completo via Swagger UI

## 8. Ajustes finais

- [x] 8.1 Atualizar README do backend (Docker, `.env.example`, migrations, estrutura CA/DDD por módulo)

## 9. Dev local — Docker e banco (após `.env` do desenvolvedor)

> Executar **somente depois** que o desenvolvedor tiver `.env` com portas confirmadas (padrão: 6015 / 6016).

- [x] 9.1 Subir PostgreSQL e Redis: `docker compose up -d` (usar portas do `.env`)
- [x] 9.2 Rodar migration inicial: `prisma migrate dev --name init-auth`
