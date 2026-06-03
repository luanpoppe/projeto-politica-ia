## Purpose

Landing page pública do Projeto Política IA: apresentação do produto, funcionalidades planejadas, navegação global e experiência responsiva com animações leves.

## Requirements

### Requirement: Landing page pública

O frontend DEVE exibir uma landing page na rota `/` apresentando o Projeto Política IA e suas funcionalidades planejadas (participação cívica, informação sobre representantes, alertas, etc.), em português do Brasil.

#### Scenario: Visitante acessa a home

- **WHEN** um visitante navega para `/`
- **THEN** o sistema exibe hero, seções de funcionalidades e CTAs para cadastro e login
- **AND** não exige autenticação

#### Scenario: Conteúdo institucional

- **WHEN** a landing page é renderizada
- **THEN** o sistema apresenta pelo menos três blocos de funcionalidades com título e descrição breve
- **AND** inclui links ou botões para `/cadastro` e `/login`

### Requirement: Design responsivo e moderno

A landing page DEVE ser responsiva (mobile-first), com tipografia legível, espaçamento consistente e paleta visual clean/moderna alinhada ao produto cívico.

#### Scenario: Visualização em mobile

- **WHEN** a landing é acessada em viewport estreita (< 768px)
- **THEN** o layout empilha seções verticalmente sem overflow horizontal
- **AND** CTAs permanecem acessíveis e legíveis

#### Scenario: Visualização em desktop

- **WHEN** a landing é acessada em viewport ampla (≥ 1024px)
- **THEN** o layout utiliza grid ou colunas para melhor aproveitamento do espaço
- **AND** mantém hierarquia visual clara entre hero e funcionalidades

### Requirement: Animações leves e performáticas

A landing page DEVE incluir animações sutis (ex.: fade-in ao scroll, hover em botões) que melhorem a percepção de interatividade sem degradar performance perceptível.

#### Scenario: Animação ao entrar na viewport

- **WHEN** uma seção entra na área visível durante o scroll
- **THEN** o sistema aplica transição CSS discreta (opacity/transform)
- **AND** a animação completa em menos de 500ms

#### Scenario: Preferência de movimento reduzido

- **WHEN** o usuário tem `prefers-reduced-motion: reduce` ativo
- **THEN** o sistema desativa ou simplifica animações não essenciais
- **AND** todo o conteúdo permanece acessível sem depender de animação

#### Scenario: Performance de carregamento

- **WHEN** a landing page carrega
- **THEN** o sistema NÃO depende de biblioteca pesada de animação (ex.: GSAP, Lottie full-screen)
- **AND** prioriza CSS nativo e, se necessário, Intersection Observer leve

### Requirement: Navegação global

O frontend DEVE incluir header ou barra de navegação compartilhada nas páginas públicas com logo/nome do projeto e links para login e cadastro.

#### Scenario: Visitante não autenticado

- **WHEN** o usuário não está logado
- **THEN** a navegação exibe links para `/login` e `/cadastro`
- **AND** não exibe botão de logout

### Requirement: Metadados e idioma

A landing e o layout raiz DEVEM usar `lang="pt-BR"` e metadados (title, description) coerentes com o Projeto Política IA.

#### Scenario: SEO básico

- **WHEN** a página inicial é servida
- **THEN** o documento HTML declara `lang="pt-BR"`
- **AND** possui title e meta description informativos
