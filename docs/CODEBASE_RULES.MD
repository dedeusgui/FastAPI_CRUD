# Regras da Codebase

## Organização

- A estrutura da aplicação é orientada por domínio: `user`, `tasks`, `friends` e `auth`.
- Cada domínio deve manter, quando fizer sentido, as pastas `routes`, `services`, `repositories`, `models`, `schemas` e `dependencies`.
- Novas funcionalidades devem seguir o padrão já adotado antes de introduzir novas convenções.

## Responsabilidades

- `routes` tratam HTTP, dependências e contrato da API.
- `services` concentram regra de negócio e autorização.
- `repositories` concentram leitura e escrita no banco.
- `models` representam entidades persistidas.
- `schemas` definem payloads e respostas.
- `dependencies` centralizam composição de serviços e autenticação.

## Padrões de manutenção

- Evitar lógica de negócio diretamente em rotas.
- Evitar acesso ao banco fora de `repositories`, salvo composição mínima de dependências já existente.
- Mensagens e status de erro devem continuar coerentes com os testes.
- Toda regra de negócio nova deve nascer acompanhada de teste ou atualização de teste existente.
- Mudanças em contratos HTTP devem refletir em `schemas`, testes e documentação.

## Documentação

- `ARCHITECTURE.MD` descreve a visão estrutural da aplicação.
- `BUSINESS_RULES.MD` registra apenas regras realmente implementadas.
- `README.md` funciona como porta de entrada curta do projeto.
- `FRONTEND_STANDARDS.MD` define padrões visuais, convenções de código e limites do frontend.
- Documentação deve ser curta, objetiva e compatível com o tamanho do projeto.
