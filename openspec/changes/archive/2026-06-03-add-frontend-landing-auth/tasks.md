## Notas para implementação (`/opsx:apply`)

> - Estender **apenas** `.env.example` com `NEXT_PUBLIC_API_URL` — **não** criar `.env` automaticamente.
> - Backend deve estar rodando (`pnpm dev` em `packages/backend`) com CORS habilitado.
> - Validar fluxo manualmente após implementação.

## 1. Configuração e infraestrutura

- [x] 1.1 Adicionar `NEXT_PUBLIC_API_URL` ao `.env.example` da raiz (ex.: `http://localhost:3011`)
- [x] 1.2 Adicionar dependências `react-hook-form` e, se usar schemas Zod, `@hookform/resolvers` + `zod` no `packages/frontend`
- [x] 1.3 Criar cliente axios em `src/lib/api/client.ts` com baseURL da env
- [x] 1.4 Criar `src/lib/auth/auth.service.ts` com `register`, `login`, `refresh`, `logout`
- [x] 1.5 Criar utilitário `src/utils/cpf.util.ts` (normalização e validação de dígitos)

## 2. Estado de sessão (Auth)

- [x] 2.1 Criar `AuthContext` + `AuthProvider` (tokens em localStorage, boot, login/logout)
- [x] 2.2 Implementar interceptor axios: Bearer token + refresh automático em 401
- [x] 2.3 Integrar `AuthProvider` no `layout.tsx` (client wrapper)
- [x] 2.4 Atualizar `layout.tsx`: `lang="pt-BR"`, metadados PT-BR

## 3. Layout e componentes base

- [x] 3.1 Criar componentes UI reutilizáveis: `Button`, `Input` (compatível com RHF `register`/`Controller`), `Card` (Tailwind)
- [x] 3.2 Criar `Header` com navegação condicional (visitante vs autenticado)
- [x] 3.3 Ajustar `globals.css` com tokens de cor/espaçamento da identidade visual

## 4. Landing page (`/`)

- [x] 4.1 Criar seções: `Hero`, `Features`, `FeatureCard`, `CtaSection`
- [x] 4.2 Substituir `app/page.tsx` pela landing completa em PT-BR
- [x] 4.3 Adicionar animações CSS leves + `prefers-reduced-motion`
- [x] 4.4 Implementar fade-in on scroll (Intersection Observer) em componente client leve
- [x] 4.5 Garantir responsividade mobile-first (sem overflow horizontal)

## 5. Telas de autenticação

- [x] 5.1 Criar `/cadastro` com `RegisterForm` (React Hook Form): name, email, cpf, birthDate, password, **confirmPassword** (validar igualdade com senha; não enviar à API) + integração API
- [x] 5.2 Criar `/login` com `LoginForm` (React Hook Form): email, password + redirect para `/conta` (suportar `returnUrl`)
- [x] 5.3 Criar `/conta` protegida com `AuthGuard` — mensagem “Você está logado”
- [x] 5.4 Implementar botão de logout (header e/ou página `/conta`)
- [x] 5.5 Feedback de loading/erro com `react-hot-toast` nos formulários

## 6. Limpeza e rotas legadas

- [x] 6.1 Remover ou redirecionar `app/signup/` → `/cadastro`
- [x] 6.2 Remover ou redirecionar `app/profile/` e `app/profile/[id]/`
- [x] 6.3 Remover dependências/código morto não utilizado (ex.: imports `next/router`)

## 7. Documentação e qualidade

- [x] 7.1 Atualizar README do frontend (env, rotas, fluxo auth)
- [x] 7.2 Validar `pnpm build` no frontend sem erros
- [x] 7.3 Testar fluxo manual: landing → cadastro → login → conta → logout
