# Padrões do Frontend

## Objetivo

Este documento é a fonte de verdade para padrões de design, limites de implementação e convenções de código do `frontend/`.

Ele é intencionalmente prescritivo. Novos trabalhos no frontend devem seguir estas regras, mesmo que algumas telas existentes ainda precisem de alinhamento.

As regras de backend, regras de negócio e a propriedade dos contratos da API continuam documentadas em outros arquivos. Este documento define como o frontend deve se comportar enquanto o backend permanece inalterado.

## Direção do Produto

O frontend deve transmitir:

- clareza antes de impacto visual
- sensação premium sem excesso
- leitura calma, consistente e confiável
- identidade de sistema, e não estilos isolados por página

A direção do produto se apoia em uma linguagem visual contida:

- superfícies neutras como base
- um único acento principal para interação
- cores semânticas apenas para feedback
- hierarquia forte por espaço, tipografia e layout
- reutilização de primitivas antes de composições pontuais

## Limites Obrigatórios

### O backend continua dono do backend

O frontend não deve:

- redefinir contratos de API
- inventar comportamentos de persistência
- duplicar regras de negócio do backend como lógica permanente no cliente
- normalizar inconsistências do backend de forma silenciosa a ponto de esconder problemas contratuais
- introduzir fluxos falsos que aparentem ser reais nas áreas autenticadas do produto

Se o backend não oferecer um estado, campo ou comportamento necessário, o frontend deve expor essa limitação com clareza e registrar a lacuna, em vez de criar um contorno escondido.

### Escopo do frontend

O frontend é responsável por:

- composição de rotas e controle de acesso
- apresentação e design de interação
- estado do cliente derivado das APIs existentes
- estados de carregamento, vazio, sucesso e erro
- primitivas de UI reutilizáveis e padrões de layout
- mapeamento seguro das respostas do backend para a interface

### Limite de acesso a dados

- Todo acesso HTTP deve passar por `frontend/src/services/api/client.ts`.
- Funções específicas de domínio devem ficar em `frontend/src/services/modules/`.
- Componentes e páginas não devem chamar `fetch` diretamente.
- URLs da API, política de credenciais e tratamento de erro de baixo nível devem permanecer centralizados.

### Limite de estilização

- Regras visuais compartilhadas devem ficar em `frontend/src/styles/`.
- Use tokens compartilhados, primitivas compartilhadas e variantes documentadas antes de criar novas classes.
- Não introduza um segundo sistema de estilos de forma ad hoc.
- Não espalhe cores, espaçamentos, sombras ou raios hardcoded em implementações isoladas quando essa decisão deve pertencer a um token ou classe compartilhada.

## Arquitetura do Frontend

### Bootstrap e estrutura principal

A forma atual da aplicação é a referência:

- `App.tsx` conecta providers globais e o router
- `context/AuthContext.tsx` controla bootstrap de sessão e estado do usuário autenticado
- `routes/` controla proteção de rotas e composição da navegação

Esse deve continuar sendo o caminho padrão de composição para novos trabalhos.

### Responsabilidade das pastas

#### `pages/`

Páginas compõem telas completas. Uma página pode:

- chamar funções de serviço do domínio
- manter estado local da tela
- orquestrar fluxos de submit e refresh
- montar seções usando peças compartilhadas de UI e layout

Uma página não deve virar um ponto genérico de biblioteca de componentes.

#### `components/ui/`

Primitivas visuais compartilhadas vivem aqui. Esses componentes devem:

- ser reutilizáveis entre telas
- expor props estáveis e enxutas
- evitar lógica de busca ou orquestração específica de domínio
- preferir composição em vez de árvores condicionais específicas de uma página

#### `components/layout/`

Use esta pasta para frames reutilizáveis de página e estruturas de navegação, como app shells, wrappers de seção e layouts persistentes.

#### `context/`

Context deve ser usado apenas para estado realmente compartilhado entre rotas ou áreas amplas da aplicação. O padrão é começar com estado local. Promova para context apenas quando prop drilling ou coordenação duplicada entre rotas se tornarem reais.

#### `services/api/`

Esta camada é dona de:

- execução de requisições
- configuração de credenciais
- parsing de respostas
- erros de API normalizados

#### `services/modules/`

Esta camada é dona de funções de domínio como auth, tasks e friends. Esses módulos devem permanecer finos e alinhados aos contratos do backend.

#### `types/`

DTOs de domínio compartilhados e payloads de requisição reutilizados entre módulos devem viver aqui. Os nomes devem permanecer alinhados aos conceitos do backend.

#### `utils/`

Apenas helpers puros pertencem aqui. Utilitários não devem esconder chamadas de rede, roteamento ou efeitos colaterais.

#### `hooks/`

Crie um hook apenas quando a lógica for reutilizada ou ficar materialmente mais clara como hook. Não crie hooks que apenas renomeiam `useState`, `useEffect` ou handlers locais simples.

## Regras do Design System

### Fonte da consistência visual

O design system deve ser conduzido pelos estilos compartilhados em `frontend/src/styles/`, com tokens e regras base/componentes centralizados ali.

A direção atual já aponta para:

- tokens de cor, espaçamento, raio, sombra e containers
- um ponto global compartilhado de entrada de estilos
- primitivas reutilizáveis de layout e componentes

Novas decisões de design devem estender esse sistema, não contorná-lo.

### Cor

- Canvas e superfícies neutras são a fundação padrão.
- Um único acento principal deve carregar interação, estado ativo e ênfase de foco.
- Success, warning e danger são apenas semânticos.
- Uso decorativo de cor deve ser raro e justificado pelo conteúdo.

### Tipografia

- Headlines devem ser curtas, diretas e de alto sinal.
- Textos de apoio devem explicar uma ideia por vez, sem empilhar promessas.
- A hierarquia deve vir de tamanho, peso, espaçamento e layout, não de ruído visual.
- O copy de interface pode permanecer em português onde o produto já utiliza português.

### Espaçamento e layout

- Prefira uma escala consistente de espaçamento em vez de ajustes visuais por página.
- Seções grandes devem respirar antes de receber mais cartões, bordas ou divisores.
- Use containers compartilhados e padrões de hero/conteúdo antes de inventar novos esqueletos de página.
- Layouts densos são exceção, não padrão.

### Superfícies e profundidade

- Prefira cartões sólidos com bordas sutis e sombras controladas.
- Evite blur pesado, gradientes em excesso e efeitos decorativos que disputem atenção com o conteúdo.
- Valores de raio devem vir da escala compartilhada.

### Componentes e estados

Famílias de componentes compartilhados devem permanecer consistentes entre páginas:

- botões: `primary`, `secondary`, `ghost`, `soft`
- feedback: `status-badge`, `form-feedback`
- primitivas de layout: `surface-card`, `page-hero-card`, `header-chip`, shells de métricas/listas/cards
- primitivas de formulário: `field`, `field-input`, `field-textarea`

Toda tela de funcionalidade deve definir:

- estado de carregamento
- estado vazio
- feedback de sucesso quando aplicável
- feedback de erro com mensagem legível para o usuário

### Interação

- Hover e motion devem apoiar clareza, não decoração.
- Estados de foco devem permanecer visíveis e acessíveis.
- Transições devem ser sutis e rápidas o suficiente para não atrasar a execução de tarefas.

## Convenções de Código

### Nomenclatura

- componentes React: `PascalCase`
- hooks: `camelCase` com prefixo `use`
- utilitários e funções de serviço: `camelCase`
- tipos e interfaces compartilhadas: `PascalCase`
- arquivos de componentes, páginas e context: `PascalCase.tsx` quando exportarem um componente
- arquivos de helper, service e type: nomes em minúsculo ou orientados ao domínio, consistentes com a estrutura atual

### Exports

- Prefira named exports para páginas, componentes, rotas e helpers.
- Use default export apenas quando houver uma razão forte de entrypoint, como em `App.tsx`.

### Imports

Mantenha os imports agrupados nesta ordem:

- pacotes externos
- imports internos de runtime
- imports somente de tipo, quando separados

Evite profundidade excessiva de caminhos relativos quando um módulo de domínio próximo ou um tipo compartilhado já deveria ser o ponto de integração.

### Tipos

- Use `interface` para contratos em formato de objeto que possam crescer ou ser estendidos.
- Use `type` para unions e casos de composição mais estreita.
- Mantenha os tipos do frontend próximos da nomenclatura do backend, salvo quando houver uma razão clara de UI para divergir.
- Não crie definições duplicadas para a mesma entidade do backend em múltiplos módulos.

### Desenho de componentes

- Componentes compartilhados de UI devem ser majoritariamente apresentacionais.
- Páginas podem controlar orquestração assíncrona e estado específico da view.
- Não mova fluxo de negócio para componentes compartilhados apenas para reduzir linhas em uma página.
- Se o mesmo bloco visual aparecer em mais de uma tela com o mesmo comportamento, extraia.
- Se o reúso for apenas especulativo, mantenha local até existir um segundo caso real.

### Estado e comportamento assíncrono

- Prefira estado local por padrão.
- Promova estado para context apenas quando múltiplas rotas ou subárvores distantes realmente precisarem da mesma fonte de verdade.
- Mantenha requisições assíncronas em páginas ou hooks dedicados, não dentro de primitivas visuais.
- O tratamento de `401` relacionado à sessão deve permanecer coerente com `AuthContext`.

### Tratamento de erro

- Mensagens voltadas ao usuário devem ser claras e acionáveis.
- Reaproveite o comportamento normalizado de `ApiError` em vez de ramificar ad hoc sobre formatos de resposta em cada página.
- Não esconda falhas de requisição silenciosamente.

### Formulários

- Valide requisitos óbvios do lado do cliente antes de disparar a requisição.
- Mantenha estados de submit, pending, sucesso e erro explícitos na interface.
- Prefira os padrões compartilhados de campo e feedback em vez de cascas customizadas de formulário.

## Padrão de Composição de Página

A direção atual do produto deve convergir para um ritmo previsível de tela:

- hero da página ou cabeçalho de contexto
- uma ou duas zonas principais de conteúdo
- área clara de métrica ou resumo quando fizer sentido
- estados explícitos de vazio, carregamento e erro
- ações posicionadas perto do conteúdo que elas afetam

Novas telas devem começar pelas primitivas compartilhadas de layout e só introduzir um novo padrão de página quando o sistema atual não conseguir expressar a necessidade com clareza.

## Definição de Pronto para Mudanças no Frontend

Uma tarefa de frontend não está completa se não:

- respeitar os contratos existentes do backend
- usar a camada de serviços em vez de chamadas HTTP diretas
- seguir o design system compartilhado e a direção dos tokens
- usar estados de feedback consistentes
- colocar o código no limite correto de pasta e responsabilidade
- evitar atalhos de estilo ou arquitetura pontuais
- atualizar este documento quando uma nova regra ou padrão reutilizável passar a fazer parte do sistema

## Regra de Adoção

Ao introduzir uma nova funcionalidade:

1. comece pela estrutura existente de rota, página, serviço e UI compartilhada
2. reutilize primeiro os tokens e as primitivas documentadas
3. adicione uma nova variante apenas se o sistema atual não conseguir expressar a necessidade com limpeza
4. documente qualquer novo padrão reutilizável quando ele passar a fazer parte do padrão oficial

## Relação com o Trabalho de Design em Andamento

Este documento define agora a estrutura estável.

Detalhes de design refinados em outro fluxo devem atualizar:

- valores de tokens
- exemplos visuais
- variantes de componentes compartilhados

Eles não devem alterar os limites arquiteturais nem permitir que responsabilidades do backend vazem para o frontend.
