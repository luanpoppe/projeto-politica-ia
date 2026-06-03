## ADDED Requirements

### Requirement: Gestão de formulários com React Hook Form

Os formulários de **cadastro** e **login** DEVEM ser implementados com **React Hook Form** (`react-hook-form`) para controle de estado, validação e submissão.

#### Scenario: Formulário de cadastro usa React Hook Form

- **WHEN** a tela `/cadastro` é renderizada
- **THEN** o formulário utiliza `useForm` (ou equivalente) do React Hook Form
- **AND** os campos são registrados via `register` ou `Controller`
- **AND** a submissão ocorre via `handleSubmit`

#### Scenario: Formulário de login usa React Hook Form

- **WHEN** a tela `/login` é renderizada
- **THEN** o formulário utiliza React Hook Form da mesma forma que o cadastro
- **AND** erros de validação client-side são exibidos a partir de `formState.errors`

#### Scenario: Estado de submissão

- **WHEN** o usuário envia cadastro ou login
- **THEN** o frontend usa `formState.isSubmitting` (ou equivalente) para desabilitar o submit durante a requisição
- **AND** erros de API podem ser mapeados para campos via `setError` quando aplicável

### Requirement: Cadastro de usuário no frontend

O frontend DEVE oferecer tela de cadastro integrada a `POST /auth/register` com campos `name`, `email`, `cpf`, `birthDate` e `password`, alinhados ao contrato do backend, **mais** um campo **repetir senha** (`confirmPassword` ou equivalente) exclusivo da UI para confirmação.

#### Scenario: Cadastro bem-sucedido

- **WHEN** o usuário preenche o formulário com dados válidos, incluindo senha e repetir senha iguais, e confirma
- **THEN** o frontend envia `POST /auth/register` para a API configurada **somente** com `name`, `email`, `cpf`, `birthDate` e `password` (sem `confirmPassword`)
- **AND** exibe feedback de sucesso
- **AND** autentica automaticamente

#### Scenario: Senhas não conferem

- **WHEN** o usuário preenche `password` e `confirmPassword` com valores diferentes e tenta enviar
- **THEN** o frontend bloqueia a submissão
- **AND** exibe erro de validação no campo repetir senha (ex.: “As senhas não conferem”)
- **AND** não chama a API

#### Scenario: Repetir senha vazio

- **WHEN** o usuário preenche `password` mas deixa repetir senha vazio e tenta enviar
- **THEN** o frontend exibe erro de validação indicando que a confirmação é obrigatória
- **AND** não chama a API

#### Scenario: Erro de validação

- **WHEN** a API retorna `400 Bad Request`
- **THEN** o frontend exibe mensagens de erro compreensíveis ao usuário
- **AND** mantém os dados não sensíveis preenchidos quando aplicável

#### Scenario: Conflito de e-mail ou CPF

- **WHEN** a API retorna `409 Conflict`
- **THEN** o frontend informa que e-mail ou CPF já está cadastrado

#### Scenario: CPF com máscara

- **WHEN** o usuário digita CPF com ou sem pontuação
- **THEN** o frontend normaliza ou aceita entrada mascarada antes do envio
- **AND** valida formato básico no cliente antes da requisição

### Requirement: Login de usuário no frontend

O frontend DEVE oferecer tela de login integrada a `POST /auth/login` com `email` e `password`.

#### Scenario: Login bem-sucedido

- **WHEN** o usuário informa credenciais válidas
- **THEN** o frontend chama `POST /auth/login`
- **AND** persiste `accessToken` e `refreshToken` de forma segura no cliente
- **AND** redireciona para a área autenticada (`/conta`)

#### Scenario: Credenciais inválidas

- **WHEN** a API retorna `401 Unauthorized`
- **THEN** o frontend exibe mensagem genérica de credenciais inválidas
- **AND** não persiste tokens

### Requirement: Persistência e renovação de sessão

O frontend DEVE manter a sessão do usuário entre recarregamentos de página e renovar o access token via `POST /auth/refresh` quando expirado ou próximo de expirar, usando o refresh token armazenado.

#### Scenario: Sessão restaurada ao recarregar

- **WHEN** o usuário recarrega a página com tokens válidos armazenados
- **THEN** o frontend considera o usuário autenticado sem exigir novo login

#### Scenario: Renovação de access token

- **WHEN** uma requisição autenticada falha por access token expirado e existe refresh token válido
- **THEN** o frontend chama `POST /auth/refresh`, atualiza os tokens armazenados e repete a operação ou mantém sessão ativa

#### Scenario: Refresh token inválido

- **WHEN** `POST /auth/refresh` retorna `401`
- **THEN** o frontend limpa tokens locais
- **AND** redireciona para `/login`

### Requirement: Logout no frontend

O frontend DEVE permitir logout explícito, chamando `POST /auth/logout` com access token (Bearer) e refresh token no body, e limpando estado local.

#### Scenario: Logout bem-sucedido

- **WHEN** o usuário autenticado aciona logout
- **THEN** o frontend envia `POST /auth/logout` com tokens necessários
- **AND** remove tokens do armazenamento local
- **AND** redireciona para `/`

### Requirement: Área autenticada mínima

O frontend DEVE oferecer rota protegida (ex.: `/conta`) acessível apenas com sessão válida, exibindo confirmação de login sem detalhes adicionais de perfil nesta fase.

#### Scenario: Usuário autenticado acessa área logada

- **WHEN** um usuário com sessão válida navega para `/conta`
- **THEN** o sistema exibe mensagem indicando que está logado (ex.: “Você está logado”)
- **AND** NÃO exibe dados de perfil além do estritamente necessário para UX (sem listar e-mail, CPF ou birthDate nesta change)

#### Scenario: Visitante tenta acessar área protegida

- **WHEN** um usuário sem sessão navega para `/conta`
- **THEN** o frontend redireciona para `/login`
- **AND** pode preservar URL de retorno para redirect pós-login

### Requirement: Navegação conforme estado de auth

A navegação global DEVE refletir o estado de autenticação do usuário.

#### Scenario: Usuário autenticado

- **WHEN** o usuário está logado
- **THEN** a navegação exibe link para `/conta` e botão de logout
- **AND** oculta links de cadastro/login quando apropriado

### Requirement: Configuração da API

O frontend DEVE obter a URL base da API via variável de ambiente pública `NEXT_PUBLIC_API_URL` documentada no `.env.example` da raiz do monorepo.

#### Scenario: Requisição à API

- **WHEN** o frontend realiza chamada de autenticação
- **THEN** usa `{NEXT_PUBLIC_API_URL}/auth/...` como destino
- **AND** falha de forma clara se a variável não estiver configurada em desenvolvimento

### Requirement: Feedback ao usuário

Formulários de auth DEVEM exibir estados de loading e erros via feedback visual (ex.: toast ou mensagens inline), reutilizando `react-hot-toast` já presente no projeto.

#### Scenario: Submissão de formulário

- **WHEN** o usuário envia login ou cadastro
- **THEN** o botão de submit fica desabilitado ou indica carregamento durante a requisição
- **AND** erros de rede exibem mensagem amigável
