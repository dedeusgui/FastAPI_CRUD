# Arquitetura

## Objetivo

Este projeto implementa uma API REST em FastAPI, com separação por domínio (`user`, `tasks`, `friends`, `auth`) e por responsabilidade técnica. O foco da arquitetura é manter o código simples, testável e fácil de evoluir.

## Camadas

1. `routes`
   Responsável por expor endpoints HTTP, validar entrada/saída com schemas e delegar a execução para a camada de serviço.

2. `services`
   Responsável pelas regras de negócio, orquestração de fluxos e validações de domínio.

3. `repositories`
   Responsável pelo acesso a dados com SQLAlchemy (consultas, persistência e remoção).

4. `models`
   Responsável por mapear entidades e tabelas do banco de dados.

5. `schemas`
   Responsável por definir contratos de entrada e saída da API (Pydantic).

## Fluxo padrão

`request HTTP -> route -> service -> repository -> banco -> response`

Esse fluxo evita acoplamento entre endpoint e banco, além de centralizar regras de negócio na camada correta.

## Decisões arquiteturais

- Organização por domínio para facilitar manutenção e escalar funcionalidades sem misturar contextos.
- Padrão em camadas para isolar responsabilidades e reduzir efeitos colaterais.
- Regras de negócio concentradas em `services`, evitando lógica de domínio em `routes`.
- Acesso a dados concentrado em `repositories`, evitando consultas espalhadas pelo projeto.

## Escopo atual

- O projeto cobre o back-end da aplicação.
- Integrações de front-end estão fora do escopo desta arquitetura no momento.
