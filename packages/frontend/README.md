# Frontend — Projeto Política IA

Interface web Next.js 15 com landing page e fluxo de autenticação integrado ao backend.

## Pré-requisitos

- Node.js e pnpm (monorepo)
- Backend rodando (`packages/backend`) com CORS habilitado

## Configuração

1. Na **raiz do monorepo**, configure o `.env` (copie de `.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3011
```

2. Instale dependências na raiz ou no pacote:

```bash
pnpm install
```

## Desenvolvimento

```bash
cd packages/frontend
pnpm dev
```

Acesse `http://localhost:3000` (porta padrão do Next.js).

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/cadastro` | Criar conta (React Hook Form + API `/auth/register`) |
| `/login` | Entrar (`/auth/login`) |
| `/conta` | Área autenticada mínima (protegida) |

Rotas legadas redirecionam: `/signup` → `/cadastro`, `/profile` → `/conta`.

## Autenticação (cliente)

- Tokens `accessToken` e `refreshToken` em `localStorage`
- Renovação automática via interceptor axios (`POST /auth/refresh`)
- Logout chama `POST /auth/logout` e limpa tokens locais

## Stack

- Next.js 15 (App Router), Tailwind CSS, axios
- **React Hook Form** + Zod (`@hookform/resolvers`) nos formulários de auth
- react-hot-toast para feedback

## Build

```bash
pnpm build
```
