## Why

O backend já oferece autenticação completa (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`), mas o frontend ainda é o template padrão do Next.js, com telas placeholder sem integração real. Cidadãos precisam de uma interface pública clara sobre o produto e um fluxo funcional de cadastro/login antes das funcionalidades cívicas (localidades, representantes, alertas).

Esta change entrega a primeira experiência web do Projeto Política IA: landing page institucional e fluxo de identidade conectado à API existente.

## What Changes

- Substituir a home (`/`) por uma **landing page** sobre as funcionalidades do produto, com design clean/moderno, responsivo e animações leves (CSS/`prefers-reduced-motion`, sem bibliotecas pesadas de animação)
- Criar tela de **cadastro** (`/cadastro`) integrada a `POST /auth/register` (name, email, cpf, birthDate, password), com campo adicional **repetir senha** validado no cliente (não enviado à API), formulário gerenciado por **React Hook Form**
- Criar tela de **login** (`/login`) integrada a `POST /auth/login`, com formulário gerenciado por **React Hook Form**
- Implementar **gestão de sessão no cliente**: armazenar access/refresh tokens, renovação automática via `POST /auth/refresh` quando necessário
- Criar tela **autenticada mínima** (`/conta` ou `/dashboard`) que confirma login sem exibir dados de perfil além do necessário para UX (ex.: mensagem “Você está logado”)
- Adicionar **logout** no frontend (`POST /auth/logout` + limpeza local de tokens)
- Proteger rotas autenticadas no App Router (redirect para login se não autenticado)
- Configurar URL da API via variável de ambiente (`NEXT_PUBLIC_API_URL` no `.env.example` da raiz)
- Remover/substituir páginas placeholder existentes (`signup`, `profile` incompletos) e corrigir imports legados (`next/router` em App Router)
- Header/nav compartilhado com links para landing, login/cadastro ou logout conforme estado da sessão

## Capabilities

### New Capabilities

- `frontend-landing`: Landing page pública com seções de funcionalidades, CTA para cadastro/login, layout responsivo e micro-animações performáticas
- `frontend-auth`: Telas de cadastro, login, área logada mínima, logout e persistência/renovação de tokens integrados ao backend `user-auth`

### Modified Capabilities

<!-- Nenhuma alteração nos requisitos do backend user-auth — apenas consumo da API existente -->

## Impact

- **Pacote:** `packages/frontend` (Next.js 15, App Router, Tailwind, axios, **react-hook-form**, react-hot-toast)
- **API:** consome endpoints existentes em `packages/backend` (`/auth/*`); requer CORS já habilitado e `NEXT_PUBLIC_API_URL` apontando para o backend
- **Env:** estender `.env.example` na raiz com `NEXT_PUBLIC_API_URL` (sem criar `.env` automaticamente)
- **Arquivos afetados:** `src/app/page.tsx`, novas rotas em `src/app/`, novos componentes UI, serviços/hooks de auth, possível middleware ou guard client-side
- **Fora de escopo nesta change:** perfil completo do usuário, recuperação de senha, OAuth, dashboard com dados cívicos
