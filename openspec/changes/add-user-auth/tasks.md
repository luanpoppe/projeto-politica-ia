## Notas para implementação (`/opsx:apply`)

> **Importante — Docker e `.env`**
>
> - Criar **apenas** `.env.example` — **não** criar `.env` automaticamente.
> - **Não** executar `docker compose up -d` durante a geração inicial de arquivos.
> - Portas padrão no `.env.example`: `POSTGRES_PORT=6015`, `REDIS_PORT=6016` (livres na máquina do dev).
> - O desenvolvedor copia `.env.example` → `.env` e ajusta portas se necessário.
> - **Depois** do `.env` confirmado, rodar Docker e migrations (tarefas 9.x abaixo).

## 1. Infraestrutura e dependências

- [ ] 1.1 Adicionar dependências no backend: `@prisma/client`, `prisma`, `@nestjs/jwt`, `bcrypt`, `ioredis` e tipos (`@types/bcrypt`) — **sem** Passport
- [ ] 1.2 Criar `docker-compose.yml` na raiz com PostgreSQL e Redis; portas via `POSTGRES_PORT` e `REDIS_PORT` do `.env`
- [ ] 1.3 Criar **`.env.example`** na raiz (portas `6015` / `6016`; `PORT=3011`; JWT, `DATABASE_URL`, `REDIS_URL`) — **não** criar `.env`
- [ ] 1.4 Configurar backend para carregar o `.env` da raiz do monorepo
- [ ] 1.5 Estender `EnvService` com validação Zod das novas variáveis de ambiente

## 2. Infraestrutura compartilhada (`shared/infrastructure/`)

- [ ] 2.1 Criar `SharedInfrastructureModule` com `PrismaService` e `RedisService` (clients técnicos, não-domínio)
- [ ] 2.2 Inicializar Prisma (`prisma/schema.prisma`) com modelo `User` e scripts `db:*`

## 3. Módulo `users` (Clean Architecture + DDD)

- [ ] 3.1 **Domain:** criar entidade `User` em `modules/users/domain/entities/`
- [ ] 3.2 **Domain:** definir interface `IUserRepository` (port) em `modules/users/domain/repositories/`
- [ ] 3.3 **Infrastructure:** implementar `PrismaUserRepository` em `modules/users/infrastructure/repositories/`
- [ ] 3.4 Registrar port → adapter no `UsersModule` (`USER_REPOSITORY` → `PrismaUserRepository`)
- [ ] 3.5 Exportar `USER_REPOSITORY` para consumo pelo módulo `auth`

## 4. Módulo `auth` — domain e infrastructure

- [ ] 4.1 **Domain:** definir interface `IRefreshTokenRepository` (port) em `modules/auth/domain/repositories/`
- [ ] 4.2 **Infrastructure:** implementar `RedisRefreshTokenRepository` (TTL, rotação, revogação, índice `user:{userId}:refresh_tokens`)
- [ ] 4.3 **Infrastructure:** implementar `BcryptPasswordHasher` em `modules/auth/infrastructure/services/`
- [ ] 4.4 **Infrastructure:** criar `JwtAuthGuard` (`CanActivate` + `JwtService.verifyAsync`) — sem Passport
- [ ] 4.5 Registrar ports → adapters no `AuthModule`

## 5. Módulo `auth` — application (use cases)

- [ ] 5.1 Configurar `JwtModule` no `AuthModule` com secret e expiração via `EnvService`
- [ ] 5.2 Implementar `RegisterUseCase` (valida unicidade, hasheia senha, persiste via `IUserRepository`)
- [ ] 5.3 Implementar `LoginUseCase` (valida credenciais, emite JWT + refresh token)
- [ ] 5.4 Implementar `RefreshTokenUseCase` (rotação obrigatória: invalida anterior, emite novo par)
- [ ] 5.5 Implementar `LogoutUseCase` (revoga **todos** os refresh tokens ativos do usuário via `IRefreshTokenRepository`)
- [ ] 5.6 Garantir que use cases dependem apenas de **interfaces** do domain, nunca de Prisma/Redis diretamente

## 6. Módulo `auth` — adaptador HTTP (`infrastructure/http/`)

- [ ] 6.1 Criar DTOs Zod em `infrastructure/http/dto/`: `RegisterDto`, `LoginDto`, `RefreshTokenDto`, `LogoutDto`
- [ ] 6.2 Criar metadados Swagger do módulo auth em `infrastructure/http/swagger/` (tags, `@ApiOperation`, `@ApiResponse`, schemas de resposta)
- [ ] 6.3 Criar `AuthController` em `infrastructure/http/` com decorators Swagger, delegando para use cases
- [ ] 6.4 Registrar `AuthModule` (importando `SharedInfrastructureModule` e `UsersModule`) em `AppModule`
- [ ] 6.5 Remover DTO placeholder `create-user.dto.ts` se não for mais utilizado

## 7. Documentação e qualidade

- [ ] 7.1 Garantir respostas de erro consistentes (400, 401, 409)
- [ ] 7.2 Escrever testes e2e: register, login, refresh com rotação, reuso de token, logout revogando todas as sessões
- [ ] 7.3 Validar fluxo completo via Swagger UI

## 8. Ajustes finais

- [ ] 8.1 Atualizar README do backend (Docker, `.env.example`, migrations, estrutura CA/DDD por módulo)

## 9. Dev local — Docker e banco (após `.env` do desenvolvedor)

> Executar **somente depois** que o desenvolvedor tiver `.env` com portas confirmadas (padrão: 6015 / 6016).

- [ ] 9.1 Subir PostgreSQL e Redis: `docker compose up -d` (usar portas do `.env`)
- [ ] 9.2 Rodar migration inicial: `prisma migrate dev --name init-auth`
