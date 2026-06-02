## ADDED Requirements

### Requirement: Arquitetura em camadas (Clean Architecture + DDD)

O backend DEVE organizar os módulos `auth` e `users` em camadas `domain`, `application` e `infrastructure`. Entidades e interfaces de repository DEVEM ficar em `domain`. Use cases DEVEM ficar em `application`. Implementações de repository, adaptadores externos, guards e **adaptador HTTP** (controllers, DTOs e documentação Swagger do módulo) DEVEM ficar em `infrastructure`. Controllers, DTOs e metadados Swagger DEVEM ficar em `infrastructure/http/`. Controllers DEVEM delegar para use cases, sem conter regra de negócio.

#### Scenario: Controllers, DTOs e Swagger no adaptador HTTP

- **WHEN** um módulo expõe endpoints REST documentados no Swagger
- **THEN** o controller fica em `infrastructure/http/`
- **AND** os DTOs Zod ficam em `infrastructure/http/dto/`
- **AND** decorators, schemas e helpers Swagger específicos do módulo ficam em `infrastructure/http/swagger/`
- **AND** o controller invoca use cases de `application/use-cases/`

#### Scenario: Use case depende de port, não de adapter

- **WHEN** um use case precisa persistir ou consultar dados
- **THEN** ele depende de uma interface definida em `domain/repositories/` injetada via DI
- **AND** NÃO importa diretamente Prisma, Redis ou ORM

#### Scenario: Repository com interface no domain e implementação na infrastructure

- **WHEN** o módulo `users` persiste um cidadão
- **THEN** `IUserRepository` está definida em `modules/users/domain/repositories/`
- **AND** `PrismaUserRepository` em `modules/users/infrastructure/repositories/` implementa essa interface

### Requirement: Separação de persistência de dados

O sistema DEVE separar claramente o que é persistido em cada camada: identidade e hash de senha no PostgreSQL; refresh tokens no Redis; access tokens JWT não persistidos.

#### Scenario: Cadastro persiste identidade e hash, não a senha

- **WHEN** um usuário se cadastra com sucesso
- **THEN** o PostgreSQL recebe `id`, `name`, `email`, `cpf`, `birthDate` e `passwordHash` (bcrypt)
- **AND** a senha em texto plano NÃO é armazenada em nenhum banco ou cache

#### Scenario: Login valida hash e emite tokens sem persistir access token

- **WHEN** um usuário faz login com sucesso
- **THEN** o sistema compara a senha informada com `passwordHash` no PostgreSQL
- **AND** emite `accessToken` (JWT) apenas na resposta, sem gravá-lo
- **AND** armazena o refresh token no Redis

#### Scenario: Access token é stateless

- **WHEN** uma rota protegida recebe um access token válido
- **THEN** o sistema valida o JWT por assinatura e expiração, sem consultar PostgreSQL ou Redis para o access token

### Requirement: Cadastro de usuário

O sistema DEVE permitir que um novo usuário se cadastre com nome, e-mail, CPF, data de nascimento e senha. O e-mail e o CPF DEVEM ser únicos entre todos os usuários. O CPF DEVE ser validado pelo algoritmo de dígitos verificadores e persistido normalizado (11 dígitos, sem pontuação). A data de nascimento DEVE ser uma data válida no formato ISO `YYYY-MM-DD`, anterior à data atual. A senha DEVE ser convertida em hash bcrypt (`passwordHash`) antes de persistir no PostgreSQL e nunca retornada nas respostas da API.

#### Scenario: Cadastro bem-sucedido

- **WHEN** um cliente envia `POST /auth/register` com `name`, `email`, `cpf`, `birthDate` e `password` válidos (senha mínima de 8 caracteres; CPF válido; data de nascimento no passado)
- **THEN** o sistema cria um registro em PostgreSQL com `id`, `name`, `email`, `cpf` (normalizado), `birthDate` e `passwordHash`, e retorna `201 Created` com o perfil público (`id`, `name`, `email`, `cpf`, `birthDate`, `createdAt`), sem senha nem hash

#### Scenario: E-mail duplicado

- **WHEN** um cliente envia `POST /auth/register` com um e-mail já cadastrado
- **THEN** o sistema retorna `409 Conflict` com mensagem de erro clara

#### Scenario: CPF duplicado

- **WHEN** um cliente envia `POST /auth/register` com um CPF já cadastrado
- **THEN** o sistema retorna `409 Conflict` com mensagem de erro clara

#### Scenario: CPF inválido

- **WHEN** um cliente envia `POST /auth/register` com CPF em formato inválido ou com dígitos verificadores incorretos
- **THEN** o sistema retorna `400 Bad Request` com detalhes de validação

#### Scenario: Data de nascimento inválida

- **WHEN** um cliente envia `POST /auth/register` com `birthDate` em formato inválido, igual à data atual ou no futuro
- **THEN** o sistema retorna `400 Bad Request` com detalhes de validação

#### Scenario: Entrada inválida

- **WHEN** um cliente envia `POST /auth/register` com campos inválidos ou ausentes
- **THEN** o sistema retorna `400 Bad Request` com detalhes de validação

### Requirement: Login de usuário

O sistema DEVE autenticar usuários com e-mail e senha e emitir um access token e um refresh token em caso de sucesso.

#### Scenario: Login bem-sucedido

- **WHEN** um cliente envia `POST /auth/login` com credenciais válidas
- **THEN** o sistema retorna `200 OK` com `accessToken`, `refreshToken` e metadados do token (`expiresIn` do access token)

#### Scenario: Credenciais inválidas

- **WHEN** um cliente envia `POST /auth/login` com e-mail ou senha incorretos
- **THEN** o sistema retorna `401 Unauthorized` com mensagem genérica que não revela se o e-mail existe

#### Scenario: Entrada inválida

- **WHEN** um cliente envia `POST /auth/login` com campos inválidos ou ausentes
- **THEN** o sistema retorna `400 Bad Request` com detalhes de validação

### Requirement: Renovação de token com rotação

O sistema DEVE permitir que clientes obtenham um novo access token usando um refresh token válido e não revogado. Cada renovação bem-sucedida DEVE rotacionar o refresh token: o token apresentado na requisição DEVE ser invalidado imediatamente e NÃO DEVE ser reutilizável; um novo refresh token DEVE ser emitido junto com o novo access token.

#### Scenario: Renovação bem-sucedida com rotação

- **WHEN** um cliente envia `POST /auth/refresh` com um refresh token válido e não revogado
- **THEN** o sistema retorna `200 OK` com um novo `accessToken`, um novo `refreshToken` e metadados atualizados
- **AND** o refresh token utilizado na requisição é invalidado e não pode ser usado novamente

#### Scenario: Reuso de refresh token invalidado

- **WHEN** um cliente envia `POST /auth/refresh` com um refresh token que já foi utilizado em uma renovação anterior bem-sucedida
- **THEN** o sistema retorna `401 Unauthorized`

#### Scenario: Refresh token inválido ou revogado

- **WHEN** um cliente envia `POST /auth/refresh` com um refresh token inválido, expirado ou revogado
- **THEN** o sistema retorna `401 Unauthorized`

### Requirement: Logout de usuário

O sistema DEVE revogar **todos os refresh tokens ativos** do usuário autenticado no logout — encerrando sessões em todos os dispositivos. Tokens já rotacionados ou expirados não permanecem ativos no Redis; o logout limpa o conjunto restante vinculado ao `userId`.

#### Scenario: Logout revoga todas as sessões do usuário

- **WHEN** um cliente autenticado envia `POST /auth/logout` com um refresh token válido
- **THEN** o sistema revoga **todos** os refresh tokens ativos daquele usuário no Redis
- **AND** retorna `204 No Content`

#### Scenario: Logout com token inválido

- **WHEN** um cliente envia `POST /auth/logout` com um refresh token já revogado ou desconhecido
- **THEN** o sistema retorna `204 No Content` (comportamento idempotente)

### Requirement: Validação de access token

O sistema DEVE validar access tokens JWT em rotas protegidas via guard customizado (`JwtAuthGuard` + `JwtService`), sem uso de Passport, e rejeitar tokens expirados ou inválidos.

#### Scenario: Access token válido

- **WHEN** um cliente envia uma requisição a uma rota protegida com um access token válido e não expirado no header `Authorization: Bearer`
- **THEN** o sistema processa a requisição com a identidade do usuário autenticado disponível para os handlers

#### Scenario: Access token ausente ou inválido

- **WHEN** um cliente envia uma requisição a uma rota protegida sem token ou com token inválido/expirado
- **THEN** o sistema retorna `401 Unauthorized`

### Requirement: Armazenamento de refresh token no Redis

O sistema DEVE persistir refresh tokens no Redis (não no PostgreSQL). Cada refresh token armazenado DEVE ter um TTL correspondente à sua expiração. Tokens revogados ou rotacionados DEVEM ser removidos no Redis para que não possam ser reutilizados.

#### Scenario: Refresh token armazenado no login

- **WHEN** um usuário faz login com sucesso
- **THEN** o sistema armazena o refresh token no Redis com TTL igual à expiração configurada do refresh token

#### Scenario: Refresh token removido no logout

- **WHEN** um usuário faz logout com sucesso
- **THEN** o sistema remove ou invalida **todos** os refresh tokens ativos desse usuário no Redis

#### Scenario: Refresh token substituído na rotação

- **WHEN** um refresh token é utilizado com sucesso em `/auth/refresh`
- **THEN** o sistema invalida o refresh token antigo no Redis e armazena o recém-emitido com um TTL renovado

### Requirement: Segurança de senha e dados sensíveis

O sistema DEVE aplicar hash bcrypt (cost factor mínimo 10) na senha e persistir somente `passwordHash` no PostgreSQL. A senha em texto plano NÃO DEVE ser armazenada. Refresh tokens NÃO DEVEM ser armazenados no PostgreSQL. Access tokens JWT NÃO DEVEM ser persistidos.

#### Scenario: Senha e hash nunca expostos na API

- **WHEN** qualquer endpoint de autenticação é chamado com sucesso ou com erro
- **THEN** o corpo da resposta NÃO DEVE conter a senha em texto plano nem o `passwordHash`

#### Scenario: Refresh token não persistido em banco relacional

- **WHEN** um refresh token é emitido, rotacionado ou revogado
- **THEN** o sistema DEVE gerenciar o estado do refresh token exclusivamente no Redis

### Requirement: Infraestrutura de desenvolvimento local

O projeto DEVE fornecer um `docker-compose.yml` na raiz do repositório com serviços PostgreSQL e Redis para desenvolvimento local. As portas expostas no host por esses serviços DEVEM ser configuradas via variáveis de ambiente no `.env` da raiz.

#### Scenario: Docker Compose lê portas do env da raiz

- **WHEN** um desenvolvedor configura `.env` (a partir de `.env.example`) e executa `docker compose up` na raiz
- **THEN** PostgreSQL e Redis iniciam com portas no host definidas por `POSTGRES_PORT` e `REDIS_PORT` (padrão documentado: **6015** e **6016**)

#### Scenario: Backend conecta usando env da raiz

- **WHEN** a aplicação backend inicia com o `.env` da raiz carregado
- **THEN** ela conecta ao PostgreSQL via `DATABASE_URL` e ao Redis via `REDIS_URL` usando as portas configuradas
