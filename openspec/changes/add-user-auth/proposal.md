## Why

O Projeto Política IA precisa de uma base de identidade segura antes de qualquer funcionalidade cívica (localidades, representantes, alertas). Sem cadastro, login e gestão de sessão, não há como personalizar conteúdo, proteger dados do usuário nem cumprir requisitos de LGPD desde o início.

Esta é a primeira implementação concreta do backend e estabelece o padrão arquitetural (**Clean Architecture + DDD**), persistência (Prisma), validação (Zod) e documentação (Swagger) para o restante do monorepo.

## What Changes

- Adicionar Prisma (versão mais recente) com PostgreSQL como banco de dados
- Criar schema inicial com modelo `User` no PostgreSQL: identidade do cidadão (`id`, `name`, `email`, `cpf`, `birthDate`) e **hash bcrypt da senha** (`passwordHash`) — a senha em texto plano nunca é persistida
- Implementar rotas de autenticação:
  - `POST /auth/register` — cadastro de usuário
  - `POST /auth/login` — login com emissão de access token e refresh token
  - `POST /auth/refresh` — renovação de access token via refresh token, com **rotação obrigatória** (o token utilizado é inativado e um novo é emitido)
  - `POST /auth/logout` — revogação de **todos** os refresh tokens ativos do usuário
- Hash de senha com bcrypt
- JWT para access tokens (curta duração)
- Refresh tokens opacos (longa duração) persistidos no **Redis**, com TTL e revogação explícita
- **Rotação de refresh token:** a cada uso em `/auth/refresh`, o token apresentado é invalidado imediatamente (não fica salvo). Logins em dispositivos diferentes podem manter múltiplos refresh tokens ativos por usuário até logout ou expiração
- Validação de entrada com Zod/nestjs-zod; documentação Swagger (decorators, schemas e metadados HTTP) em `infrastructure/http/` de cada módulo
- Variáveis de ambiente na **raiz do projeto** (`.env`) para secrets, expiração de tokens, conexão com banco e Redis
- `docker-compose.yml` na raiz com **PostgreSQL** e **Redis**; portas via `.env` (padrão documentado: **6015** PostgreSQL, **6016** Redis); `.env.example` versionado, `.env` criado manualmente pelo dev
- Remover ou substituir o DTO de usuário placeholder existente (`create-user.dto.ts`) que não possui persistência
- Estruturar o backend em **módulos bounded context** (`auth`, `users`), cada um com camadas **`domain`**, **`application`** (use cases) e **`infrastructure`** (implementações de ports, guards e adaptador HTTP); entidades e interfaces de repository no domínio; **controllers, DTOs e documentação Swagger em `infrastructure/http/`**

### O que fica onde (persistência)

| Dado | Onde | Observação |
|------|------|------------|
| `id`, `name`, `email`, `cpf`, `birthDate` | **PostgreSQL** | Cadastro permanente do cidadão; CPF único (11 dígitos); data de nascimento como date |
| Senha (texto plano) | **Em lugar nenhum** | Descartada após gerar o hash no cadastro/login |
| `passwordHash` (bcrypt) | **PostgreSQL** | Única forma de validar senha no login |
| Refresh token | **Redis** | TTL, revogação e rotação de sessão |
| Access token (JWT) | **Não persistido** | Emitido na resposta; validado por assinatura (stateless) |

## Capabilities

### New Capabilities

- `user-auth`: Cadastro, autenticação, renovação com rotação de refresh token e encerramento de sessão de usuários cidadãos — dados de identidade (`name`, `email`, `cpf`, `birthDate`) e hash de senha no PostgreSQL; sessão (refresh tokens) no Redis; access token JWT stateless

### Modified Capabilities

- _(nenhuma — projeto greenfield, sem specs existentes)_

## Impact

- **Backend** (`packages/backend`): módulos `auth` e `users` seguindo **Clean Architecture + DDD**; adaptador HTTP em `infrastructure/http/` (**controllers, DTOs Zod e metadados Swagger** do módulo); configuração global do Swagger UI permanece em `core/`
- **Dependências**: `@prisma/client`, `prisma`, `@nestjs/jwt`, `bcrypt`, `ioredis`, tipos associados (`@types/bcrypt`). **Sem Passport** — ver decisão no design
- **Infraestrutura**: `docker-compose.yml` na raiz; `.env.example` com portas **6015** (Postgres) e **6016** (Redis); Docker e migrations **não** auto-executados na criação inicial — dev configura `.env` primeiro
- **API**: novos endpoints sob prefixo `/auth`; contrato documentado no Swagger
- **Frontend** (futuro): poderá consumir estes endpoints; fora do escopo desta change
- **Segurança/LGPD**: senha em texto plano nunca armazenada; apenas `passwordHash` no PostgreSQL; CPF e data de nascimento tratados como dados pessoais sensíveis; refresh tokens revogáveis e rotacionados no Redis; access token JWT não persistido; base para consentimento e exclusão de conta em changes futuras
