## Context

O monorepo **projeto-politica-ia** possui um backend NestJS 11 com Zod (nestjs-zod), Swagger e ConfigModule já configurados. Não há persistência de dados nem autenticação implementada — apenas um DTO placeholder de usuário sem rota funcional.

Esta change introduz a camada de identidade que sustentará o MVP cívico (cadastro, localidades, representantes, alertas). O projeto prioriza segurança, LGPD e simplicidade para cidadãos brasileiros.

**Stack existente:** NestJS, TypeScript, Zod, Swagger, pnpm monorepo.

**Stack a adicionar:** Prisma (última versão estável), PostgreSQL, Redis, `@nestjs/jwt`, bcrypt, ioredis.

## Goals / Non-Goals

**Goals:**

- Persistência de **dados de identidade** (`id`, `name`, `email`, `cpf`, `birthDate`) e **hash de senha** (`passwordHash`) com Prisma + PostgreSQL
- Persistência de **refresh tokens de sessão** no **Redis** (TTL, revogação e rotação)
- Fluxo completo: register → login → refresh (com rotação) → logout
- Access token JWT (curta duração, **não persistido**) + refresh token opaco rotacionado (longa duração, Redis)
- `docker-compose.yml` na raiz com PostgreSQL e Redis; portas via `.env` na raiz
- Validação Zod, guards JWT e documentação Swagger
- Variáveis de ambiente tipadas via serviço existente (`EnvService`), carregadas a partir do `.env` na raiz
- Estrutura **Clean Architecture + DDD**: módulos com `domain` / `application` / `infrastructure`; use cases orquestram fluxos; repositories como ports no domínio

**Non-Goals:**

- OAuth/social login (Google, gov.br)
- Verificação de e-mail ou recuperação de senha
- RBAC ou papéis administrativos
- Integração com frontend
- Perfil de localidade, consentimento LGPD ou exclusão de conta (changes futuras)
- Rate limiting e proteção contra brute force (recomendado em change posterior)

## Decisions

### 0. Separação de persistência: PostgreSQL vs Redis vs stateless

**Decisão:** cada tipo de dado tem um destino explícito — sem ambiguidade sobre o termo "credenciais".

| Dado | Destino | Papel |
|------|---------|-------|
| `id`, `name`, `email`, `cpf`, `birthDate` | PostgreSQL (`User`) | Identidade permanente do cidadão; CPF único; data de nascimento |
| Senha em texto plano | *(descartada)* | Recebida na API, hasheada imediatamente, nunca gravada |
| `passwordHash` (bcrypt) | PostgreSQL (`User`) | Validação de senha no login |
| Refresh token | Redis | Sessão ativa: emissão, rotação, revogação, TTL |
| Access token (JWT) | *(não persistido)* | Enviado ao cliente; validado por assinatura |

**Rationale:** PostgreSQL guarda quem é o usuário e como validar a senha; Redis guarda sessões efêmeras; JWT de acesso evita round-trip ao banco a cada requisição.

### 1. Banco de dados: PostgreSQL + Prisma

**Decisão:** PostgreSQL como banco relacional; Prisma na versão mais recente estável como ORM.

**Rationale:** Prisma oferece type-safety, migrations declarativas e alinha com greenfield. PostgreSQL escala bem e suporta extensões futuras (PostGIS para localidades).

### 2. Estratégia de tokens: access JWT + refresh opaco rotacionado no Redis

**Decisão:**
- **Access token:** JWT assinado com `JWT_ACCESS_SECRET`, expiração curta (15 min, configurável)
- **Refresh token:** string aleatória opaca (UUID ou crypto.randomBytes), persistida no **Redis** com TTL igual à expiração configurada (7 dias, padrão)
- **Rotação obrigatória:** a cada `POST /auth/refresh`, o token apresentado é **inativado imediatamente** (removido do Redis) e um **novo** refresh token é emitido; tentativa de reuso do token antigo retorna `401`. Tokens rotacionados **não** permanecem salvos.
- **Múltiplas sessões:** cada login em dispositivo diferente gera um refresh token ativo adicional (rastreado por usuário). Tokens antigos já rotacionados não ficam ativos.
- **Chaves Redis:**
  - `refresh:{tokenHash}` → `{ userId }` com TTL
  - `user:{userId}:refresh_tokens` → SET de `tokenHash` ativos (para revogar todos no logout)
- Armazenar hash do token, nunca o valor em texto plano

**Alternativas consideradas:**
- *Refresh token no PostgreSQL* — funciona, porém Redis é mais adequado para TTL, revogação rápida e rotação frequente
- *Apenas JWT longo* — sem revogação eficiente no logout
- *Refresh JWT* — revogação exige blacklist; token opaco + Redis é mais simples de invalidar

### 2.1. Autenticação JWT sem Passport

**Decisão:** usar **`@nestjs/jwt`** (`JwtService`) com **`JwtAuthGuard` customizado** que implementa `CanActivate` — abordagem recomendada na [documentação oficial do NestJS](https://docs.nestjs.com/security/authentication), sem `@nestjs/passport`, `passport` ou `passport-jwt`.

**Como funciona:**
- **Emissão:** use cases (`LoginUseCase`, `RefreshTokenUseCase`) chamam `jwtService.signAsync(payload)`
- **Validação:** `JwtAuthGuard` (em `auth/infrastructure/`) extrai o Bearer token, chama `jwtService.verifyAsync()` e anexa o payload em `request.user`
- **Proteção de rotas:** `@UseGuards(JwtAuthGuard)` nos endpoints que exigem autenticação

**Alternativas consideradas:**
- *Passport + passport-jwt* — **rejeitado**: ecossistema Passport com manutenção lenta; `@nestjs/passport` adiciona camada desnecessária quando só JWT é necessário
- *Biblioteca `jose`* — excelente e ativa, porém `@nestjs/jwt` já é mantido pelo time NestJS e integra nativamente com guards/DI; suficiente para access tokens nesta change
- *Lucia / Auth.js* — foco em apps full-stack ou frontend; não se encaixa no backend NestJS API-only

### 3. Hash de senha: bcrypt (cost 12)

**Decisão:** bcrypt com cost factor 12 (balanceamento segurança/performance em 2026).

**Nota:** o frontend já declara `bcryptjs` como dependência; o backend usará `bcrypt` nativo (mais performático). Manter consistência de algoritmo.

### 3.1. CPF do cidadão

**Decisão:**
- Campo obrigatório no cadastro (`cpf`)
- Armazenado no PostgreSQL como string de **11 dígitos**, sem pontuação (normalizado antes de persistir)
- **Único** entre todos os usuários (`@unique` no Prisma)
- Validação com **algoritmo de dígitos verificadores** do CPF no schema Zod (aceita entrada com ou sem máscara; normaliza para dígitos)
- Login continua por **e-mail + senha** (CPF não é credencial de autenticação nesta change)
- Dado sensível (LGPD): retornado no perfil do próprio usuário no cadastro; mascaramento em endpoints públicos fica para changes futuras

**Alternativas consideradas:**
- *CPF como login* — rejeitado nesta fase; e-mail é mais familiar para fluxo web
- *Hash do CPF* — rejeitado; CPF é identificador civil necessário para funcionalidades futuras (vínculo eleitoral, etc.)

### 3.2. Data de nascimento do cidadão

**Decisão:**
- Campo obrigatório no cadastro (`birthDate`)
- Armazenado no PostgreSQL como **date** (sem hora), via `DateTime @db.Date` no Prisma
- API aceita e retorna formato ISO `YYYY-MM-DD`
- Validação: data válida, **anterior à data atual** (não aceita hoje nem futuro)
- Dado pessoal sensível (LGPD): retornado no perfil do próprio usuário no cadastro

### 3.3. Política de senha

**Decisão:** mínimo de **8 caracteres** no MVP, sem exigência de complexidade (maiúsculas, números, símbolos). Revisão futura se necessário.

### 4. Clean Architecture e DDD (estrutura do backend)

**Decisão:** o backend segue **Clean Architecture** e **DDD tático**, organizado em **módulos** (bounded contexts). Cada módulo possui três camadas internas; a regra de dependência aponta sempre **para dentro** (infraestrutura → application → domain).

#### Camadas por módulo

| Camada | Responsabilidade | Exemplos nesta change |
|--------|------------------|------------------------|
| **`domain/`** | Entidades, value objects, **interfaces de repository (ports)**, regras de negócio puras | `User` entity; `IUserRepository`; `IRefreshTokenRepository` |
| **`application/`** | **Use cases** — orquestram fluxos, dependem apenas de ports do domain | `RegisterUseCase`, `LoginUseCase`, `RefreshTokenUseCase`, `LogoutUseCase` |
| **`infrastructure/`** | **Implementações** de ports, adaptadores externos, guards e **adaptador HTTP** | `PrismaUserRepository`, `RedisRefreshTokenRepository`, `JwtAuthGuard`, `AuthController`, DTOs, metadados Swagger |

#### Adaptador HTTP (`infrastructure/http/`)

Tudo relacionado à borda HTTP do módulo fica em **`infrastructure/http/`** — adaptador de entrada (driving adapter) da infraestrutura:

| Conteúdo | Local |
|----------|-------|
| Controllers | `infrastructure/http/*.controller.ts` |
| DTOs Zod | `infrastructure/http/dto/` |
| Decorators e schemas Swagger | `infrastructure/http/swagger/` (tags, `@ApiOperation`, `@ApiResponse`, helpers OpenAPI do módulo) |

Controllers **não contêm regra de negócio** — delegam para use cases em `application/`. A configuração **global** do Swagger UI (`DocumentBuilder`, setup em `main.ts`) permanece em `core/`, mas **toda documentação específica dos endpoints do módulo** fica em `infrastructure/http/`.

#### Infraestrutura compartilhada (`shared/infrastructure/`)

Clientes técnicos reutilizáveis (conexões) ficam fora dos bounded contexts — **não são domínio**:

- `PrismaService` — client Prisma
- `RedisService` — client Redis

Os **repositories de cada módulo** (em `modules/*/infrastructure/repositories/`) usam esses clients para implementar as interfaces definidas em `domain/`.

#### Estrutura de pastas

```
packages/backend/src/
├── shared/
│   └── infrastructure/              # clients técnicos compartilhados
│       ├── shared-infrastructure.module.ts
│       ├── prisma/prisma.service.ts
│       └── redis/redis.service.ts
├── modules/
│   ├── users/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── repositories/
│   │   │       └── user.repository.interface.ts   # port
│   │   ├── application/
│   │   │   └── use-cases/                         # (vazio ou futuros; auth orquestra cadastro)
│   │   ├── infrastructure/
│   │   │   └── repositories/
│   │   │       └── prisma-user.repository.ts      # adapter
│   │   └── users.module.ts
│   └── auth/
│       ├── domain/
│       │   └── repositories/
│       │       └── refresh-token.repository.interface.ts
│       ├── application/
│       │   └── use-cases/
│       │       ├── register.use-case.ts
│       │       ├── login.use-case.ts
│       │       ├── refresh-token.use-case.ts
│       │       └── logout.use-case.ts
│       ├── infrastructure/
│       │   ├── http/
│       │   │   ├── auth.controller.ts
│       │   │   ├── dto/                           # Zod (+ @ApiProperty quando aplicável)
│       │   │   └── swagger/                       # tags, responses, helpers OpenAPI do módulo auth
│       │   ├── repositories/
│       │   │   └── redis-refresh-token.repository.ts
│       │   ├── services/
│       │   │   └── bcrypt-password-hasher.ts
│       │   └── guards/
│       │       └── jwt-auth.guard.ts
│       └── auth.module.ts
├── core/
│   └── env.service.ts
└── app.module.ts
```

#### Injeção de dependência (ports → adapters)

No `*.module.ts`, registrar implementações contra tokens de interface:

```typescript
{ provide: USER_REPOSITORY, useClass: PrismaUserRepository }
{ provide: REFRESH_TOKEN_REPOSITORY, useClass: RedisRefreshTokenRepository }
```

Use cases recebem apenas **interfaces** do domain via DI — nunca importam Prisma ou Redis diretamente.

#### Princípios aplicados

- **Entidades no domain** — `User` é entidade rica (ou anêmica nesta fase), sem dependência de ORM
- **Repository interface no domain, implementação na infrastructure** — desacopla regra de negócio de Prisma/Redis
- **Use case = um fluxo de aplicação** — um arquivo/classe por operação (`RegisterUseCase`, etc.)
- **Adaptador HTTP em `infrastructure/http/`** — controllers, DTOs e documentação Swagger do módulo (não camada separada)
- **NestJS Module = bounded context + wiring** — `AuthModule`/`UsersModule` registram camadas e exports

**Rationale:** estabelece padrão escalável para funcionalidades cívicas futuras (localidades, representantes, petições), cada uma como módulo com a mesma estrutura de camadas.

### 5. Schema Prisma inicial

Apenas **identidade do usuário** e **hash de senha** ficam no PostgreSQL. Senha em texto plano e tokens de sessão **não** entram neste schema. Refresh tokens ficam exclusivamente no Redis; access tokens JWT não são persistidos.

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique   // usado no login
  cpf          String   @unique   // 11 dígitos, sem máscara
  birthDate    DateTime @db.Date   // data de nascimento (sem hora)
  name         String
  passwordHash String              // bcrypt — NUNCA a senha em texto plano
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 6. Contrato da API

| Método | Rota | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/auth/register` | — | `{ name, email, cpf, birthDate, password }` | `201` `{ id, name, email, cpf, birthDate, createdAt }` |
| POST | `/auth/login` | — | `{ email, password }` | `200` `{ accessToken, refreshToken, expiresIn }` |
| POST | `/auth/refresh` | — | `{ refreshToken }` | `200` `{ accessToken, refreshToken, expiresIn }` |
| POST | `/auth/logout` | Bearer | `{ refreshToken }` | `204` |

**Decisão:** logout exige access token válido + refresh token no body. Ao confirmar identidade, o sistema **revoga todos os refresh tokens ativos** daquele usuário (equivalente a logout em todos os dispositivos). "Logout seletivo por dispositivo" fica para change futura.

### 7. Variáveis de ambiente (`.env` na raiz do projeto)

O monorepo usa um único `.env` na raiz, consumido pelo backend e referenciado pelo `docker-compose.yml`.

```
# Infra (portas expostas no host — usadas pelo docker-compose)
POSTGRES_PORT=6015
REDIS_PORT=6016

# Conexões (backend) — portas devem bater com POSTGRES_PORT e REDIS_PORT acima
DATABASE_URL=postgresql://postgres:postgres@localhost:6015/projeto_politica_ia
REDIS_URL=redis://localhost:6016

# Auth
JWT_ACCESS_SECRET=<min 32 chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Backend
PORT=3011
```

Estender `EnvService` com validação Zod das vars obrigatórias na inicialização. O `ConfigModule` do backend deve carregar o `.env` da raiz do monorepo. A porta da API é configurada **somente via `.env`** (não documentar valor fixo em README ou outros artefatos).

### 8. Docker Compose para dev

**Decisão:** adicionar `docker-compose.yml` na raiz com serviços **PostgreSQL** e **Redis**. As portas expostas no host vêm de `POSTGRES_PORT` e `REDIS_PORT` do `.env` da raiz.

Exemplo de mapeamento:

```yaml
services:
  postgres:
    ports:
      - "${POSTGRES_PORT}:5432"
  redis:
    ports:
      - "${REDIS_PORT}:6379"
```

Incluir `.env.example` na raiz documentando todas as variáveis acima. **Não** versionar nem criar automaticamente o `.env` — o desenvolvedor copia e ajusta portas livres na máquina local.

#### Dev local: Docker e `.env` (nota para implementação)

**Decisão do desenvolvedor:**

- Durante a **criação inicial do código**, o agente/implementador **NÃO deve**:
  - criar o arquivo `.env` (apenas `.env.example`);
  - executar `docker compose up -d` automaticamente.
- O desenvolvedor revisará e definirá portas livres no `.env` (copiado de `.env.example`).
- **Portas padrão documentadas** no `.env.example` (livres na máquina do dev): **`POSTGRES_PORT=6015`**, **`REDIS_PORT=6016`**.
- **Depois** que o `.env` existir com portas confirmadas, aí sim subir Docker (`docker compose up -d`) e rodar migrations — essa etapa pode ser executada pelo agente ou manualmente, mas **nunca** junto com a geração inicial de arquivos.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Refresh token roubado permite sessão prolongada | Rotação a cada refresh; logout revoga **todos** os tokens ativos do usuário; TTL no Redis |
| Redis indisponível impede login/refresh | Health check na inicialização; falha explícita se Redis não conectar |
| Sem rate limiting, brute force em login | Documentar como follow-up; retornar 401 genérico |
| Secrets fracos em dev | Validar tamanho mínimo no EnvService; `.env.example` com placeholders |
| Prisma migrations em CI | Script `db:migrate` no package backend; documentar no README |
| LGPD incompleta nesta fase | CPF e data de nascimento são dados sensíveis; coletar apenas no cadastro; base para consentimento e política de retenção futura |

## Decisões fechadas

| Tema | Decisão |
|------|---------|
| Logout | Revoga **todos** os refresh tokens ativos do usuário (múltiplos dispositivos). Tokens já rotacionados/inativos não permanecem no Redis |
| Porta da API | `3011` no `.env` / `.env.example` apenas — sem mencionar em documentação |
| Senha | Mínimo 8 caracteres, sem complexidade extra no MVP |

## Migration Plan

1. Adicionar dependências e `schema.prisma` (somente `User`)
2. Criar `docker-compose.yml` e **`.env.example`** na raiz (portas padrão **6015** / **6016**); **não** criar `.env` nem subir Docker nesta etapa
3. Desenvolvedor copia `.env.example` → `.env` e confirma/ajusta portas livres
4. Subir PostgreSQL e Redis (`docker compose up -d`) — **somente após** `.env` configurado
5. Rodar `prisma migrate dev --name init-auth`
6. Implementar `shared/infrastructure`, módulos `users` e `auth` (domain → application → infrastructure) e adaptador HTTP
7. Remover DTO placeholder não utilizado
8. Validar manualmente via Swagger e testes e2e básicos (incluindo rotação e reuso de refresh token)

**Rollback:** reverter migration Prisma se necessário; endpoints novos não afetam código existente.
