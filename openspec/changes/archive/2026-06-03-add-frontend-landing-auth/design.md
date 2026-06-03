## Context

O monorepo possui backend NestJS com autenticação completa (`user-auth`) e um frontend Next.js 15 (App Router) com Tailwind, axios e react-hot-toast, mas ainda no template padrão. Existem placeholders em `signup/` e `profile/` com código incompleto (ex.: `next/router` no App Router).

O usuário quer a primeira experiência web: landing institucional + fluxo de identidade funcional, sem expor perfil detalhado ainda.

## Goals / Non-Goals

**Goals:**

- Landing page em `/` com design clean/moderno, responsivo e animações CSS leves
- Telas `/cadastro`, `/login` e `/conta` integradas à API `/auth/*`
- Sessão no cliente com access + refresh token, renovação automática e logout
- Header compartilhado com navegação condicional (logado vs visitante)
- `NEXT_PUBLIC_API_URL` no `.env.example` da raiz
- Remover/substituir rotas placeholder (`signup`, `profile/[id]`)

**Non-Goals:**

- Exibir perfil completo (nome, e-mail, CPF, birthDate) na UI
- Recuperação de senha, OAuth, verificação de e-mail
- SSR de dados de usuário ou Server Components para auth state (MVP client-side)
- Bibliotecas pesadas de animação (Framer Motion, GSAP)
- Testes E2E de browser nesta change (opcional follow-up)
- Middleware edge complexo — preferir guard client-side + redirect simples

## Decisions

### 1. Rotas (App Router)

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | Pública | Landing page |
| `/cadastro` | Pública | Formulário de registro |
| `/login` | Pública | Formulário de login |
| `/conta` | Protegida | “Você está logado” + logout |

Substituir `/signup` → `/cadastro`; remover ou redirecionar `/profile` e `/profile/[id]`.

### 2. Stack UI e animações

**Decisão:** Tailwind CSS + transições CSS (`transition`, `@keyframes` mínimos) + `IntersectionObserver` opcional em componente client leve para fade-in on scroll.

**Alternativas rejeitadas:**
- *Framer Motion* — bundle maior; desnecessário para micro-animações
- *AOS (Animate On Scroll)* — dependência extra; Observer + CSS é suficiente

**Acessibilidade:** respeitar `prefers-reduced-motion: reduce` desabilitando transforms/animations.

### 3. Identidade visual

**Decisão:** paleta sóbria cívica — fundo claro/neutro, acento em azul ou verde institucional, tipografia Geist já configurada. Componentes reutilizáveis: `Button`, `Input`, `Card`, `Section`.

Hero com headline + subheadline; grid de 3–4 cards de funcionalidades; footer minimal.

### 4. Cliente HTTP e auth

**Decisão:** módulo `src/lib/api/` com instância axios:

```typescript
// baseURL: process.env.NEXT_PUBLIC_API_URL
// interceptor: anexa Bearer accessToken
// interceptor response 401: tenta refresh uma vez, fila simples ou retry único
```

Serviços: `auth.service.ts` (`register`, `login`, `refresh`, `logout`).

**Alternativas consideradas:**
- *fetch nativo* — axios já está no projeto
- *React Query* — overkill para CRUD auth nesta fase

### 5. Estado de sessão

**Decisão:** `AuthProvider` (React Context) em layout ou wrapper client:

- Estado: `isAuthenticated`, `isLoading`
- Boot: ler tokens de `localStorage` na montagem
- Métodos: `login`, `logout`, `register` (register não loga automaticamente — redirect login)
- Tokens em `localStorage` keys: `accessToken`, `refreshToken`

**Nota de segurança:** localStorage é aceitável no MVP; httpOnly cookies exigiriam mudança no backend — fora de escopo.

**Alternativa rejeitada:** cookies sem backend BFF — backend atual retorna tokens no JSON body.

### 6. Proteção de rotas

**Decisão:** componente `AuthGuard` client-side em `/conta`:

- Se `isLoading` → skeleton/spinner
- Se `!isAuthenticated` → `redirect('/login?returnUrl=/conta')` via `useRouter`

Sem Next.js middleware nesta fase (tokens estão no client storage).

### 7. Formulários e validação

**Decisão:** **React Hook Form** (`react-hook-form`) para gestão de todos os formulários de autenticação (cadastro e login):

- Estado, submit e erros via `useForm`, `register`/`Controller` e `handleSubmit`
- Componentes `Input` integrados com `register` ou `Controller` (refs para acessibilidade)
- Validação client-side via `rules` do RHF e/ou `@hookform/resolvers` + **Zod** (schemas espelhando regras do backend)
- `formState.isSubmitting` para loading; `formState.errors` para mensagens inline
- Erros da API (400/409/401) via toast + `setError` do RHF quando aplicável

Regras mínimas de validação:

- E-mail formato válido
- Senha ≥ 8 caracteres
- **Repetir senha:** campo `confirmPassword` (ou equivalente) obrigatório no cadastro; DEVE ser igual a `password` (validação client-side via RHF `validate` ou schema Zod); **não** é enviado no body de `POST /auth/register`
- CPF: máscara + validação de dígitos (`cpf.util.ts`)
- `birthDate`: input `type="date"`, não futuro

**Alternativas rejeitadas:**
- *useState manual por campo* — verboso, difícil de manter no cadastro com vários campos (incl. confirmar senha)
- *Formik* — React Hook Form é mais leve e já é padrão comum em projetos React modernos

**Fora de escopo:** React Hook Form na landing (sem formulários além de CTAs/links).

### 8. Variáveis de ambiente

Estender `.env.example` na raiz:

```
NEXT_PUBLIC_API_URL=http://localhost:3011
```

Frontend lê via `process.env.NEXT_PUBLIC_API_URL`. Documentar no README do frontend.

### 9. Estrutura de pastas

```
packages/frontend/src/
├── app/
│   ├── page.tsx              # landing
│   ├── cadastro/page.tsx
│   ├── login/page.tsx
│   ├── conta/page.tsx
│   └── layout.tsx            # AuthProvider + Header
├── components/
│   ├── layout/Header.tsx
│   ├── landing/              # Hero, Features, FeatureCard
│   └── auth/                 # AuthGuard, RegisterForm, LoginForm (RHF)
├── lib/
│   ├── api/client.ts
│   └── auth/auth.service.ts
├── contexts/AuthContext.tsx
└── utils/cpf.util.ts         # espelho leve do backend
```

### 10. Integração com backend existente

| Ação | Endpoint | Notas |
|------|----------|-------|
| Cadastro | `POST /auth/register` | 201 → toast + redirect login |
| Login | `POST /auth/login` | 200 → salvar tokens |
| Refresh | `POST /auth/refresh` | body `{ refreshToken }` |
| Logout | `POST /auth/logout` | Bearer + body `{ refreshToken }` |

CORS já habilitado no backend (`main.ts`).

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Tokens em localStorage vulneráveis a XSS | MVP aceitável; sanitizar inputs; evitar `dangerouslySetInnerHTML`; revisitar httpOnly em change futura |
| Refresh race em múltiplas abas | Mutex simples no interceptor ou single-flight refresh |
| Animações causam jank em mobile fraco | CSS only, `will-change` moderado, reduced-motion |
| Placeholder pages confundem rotas | Remover/redirecionar signup e profile no mesmo PR |

## Migration Plan

1. Adicionar `NEXT_PUBLIC_API_URL` ao `.env.example`
2. Implementar lib auth + context
3. Construir landing e layout
4. Implementar cadastro/login/conta
5. Remover placeholders e testar fluxo manual contra backend local
6. `pnpm build` no frontend para validar

**Rollback:** reverter commits frontend; backend inalterado.

## Open Questions

- Nenhuma bloqueante — redirect pós-cadastro definido como `/login` (usuário confirma credenciais explicitamente).

## Decisões fechadas

| Tema | Decisão |
|------|---------|
| Rota área logada | `/conta` |
| Rota cadastro | `/cadastro` (substitui `/signup`) |
| Conteúdo área logada | Apenas “Você está logado”, sem dados de perfil |
| Animações | CSS + Observer, sem libs pesadas |
| Formulários auth | **React Hook Form** (cadastro e login) |
| Confirmação de senha | Campo `confirmPassword` no cadastro; validação client-side; não enviado à API |
| Pós-cadastro | Redirect para `/login` com toast de sucesso |
