# Backend — Projeto Política IA

API NestJS com autenticação de usuários (cadastro, login, refresh com rotação e logout).

## Pré-requisitos

- Node.js e pnpm (monorepo)
- Docker (PostgreSQL e Redis)

## Configuração

1. Na **raiz do monorepo**, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Ajuste as variáveis no `.env` se necessário (portas livres no host, secrets JWT com pelo menos 32 caracteres).

3. Suba a infraestrutura local:

```bash
docker compose up -d
```

4. Gere o client Prisma e aplique a migration inicial:

```bash
cd packages/backend
pnpm db:generate
pnpm db:migrate --name init-auth
```

## Desenvolvimento

```bash
pnpm dev
```

A documentação Swagger fica disponível em `/api`.

## Scripts de banco (Prisma)

| Script | Descrição |
|--------|-----------|
| `pnpm db:generate` | Gera o client Prisma |
| `pnpm db:migrate` | Cria/aplica migrations em dev |
| `pnpm db:migrate:deploy` | Aplica migrations em produção |
| `pnpm db:studio` | Abre o Prisma Studio |

## Estrutura (Clean Architecture + DDD)

```
src/
├── core/                    # Config global (EnvService, Swagger)
├── shared/infrastructure/   # Clients técnicos (Prisma, Redis)
└── modules/
    ├── users/               # Identidade do cidadão
    │   ├── domain/
    │   ├── application/
    │   └── infrastructure/
    └── auth/                # Autenticação e sessões
        ├── domain/
        ├── application/     # Use cases
        └── infrastructure/  # Repositories, guards, HTTP (controllers, DTOs, Swagger)
```

Cada módulo segue a regra de dependência **infrastructure → application → domain**. Use cases dependem apenas de **ports** (interfaces) do domínio.

## Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastro de usuário |
| POST | `/auth/login` | Login (access + refresh token) |
| POST | `/auth/refresh` | Renova tokens (rotação obrigatória) |
| POST | `/auth/logout` | Revoga todas as sessões (Bearer + refresh token no body) |

- **Access token:** JWT stateless (curta duração)
- **Refresh token:** opaco, armazenado no Redis com TTL e rotação a cada refresh

## Testes

```bash
pnpm test        # unitários
pnpm test:e2e    # e2e (requer `.env` com DATABASE_URL e REDIS_URL; Docker rodando)
```
