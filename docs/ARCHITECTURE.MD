# Arquitetura

## Objetivo

Este projeto implementa uma API REST em FastAPI para portfolio, com foco em simplicidade, separação de responsabilidades e facilidade de manutenção. A aplicação está organizada por domínio (`user`, `tasks`, `friends`, `auth`) e por camada técnica.

## Camadas

1. `routes`  
   Expõem endpoints HTTP e delegam o fluxo para a camada de serviço.

2. `services`  
   Centralizam regras de negócio, autorizações e orquestração do fluxo.

3. `repositories`  
   Isolam o acesso a dados com SQLAlchemy.

4. `models`  
   Mapeiam entidades e tabelas do banco.

5. `schemas`  
   Definem contratos de entrada e saída com Pydantic.

## Fluxo padrão

`request HTTP -> route -> service -> repository -> banco -> response`

Esse fluxo reduz acoplamento entre endpoint e persistência e deixa as regras de domínio concentradas em um ponto previsível.

## Contextos atuais

- `user`: cadastro, login e leitura do usuário autenticado
- `tasks`: CRUD básico de tarefas por usuário autenticado
- `friends`: solicitação, aceite, recusa, remoção e consulta de amizade
- `auth`: sessão persistida e autenticação por cookie `access_token`

## Autenticação

- O login gera uma sessão e grava um cookie HTTP chamado `access_token`.
- Endpoints protegidos dependem do usuário autenticado resolvido por dependências compartilhadas.
- O projeto usa autenticação por sessão, não JWT exposto ao cliente via header.

## Decisões arquiteturais

- Organização por domínio para manter contextos isolados.
- Padrão em camadas para evitar lógica de negócio em rotas.
- Regras de negócio concentradas em `services`.
- Acesso a dados concentrado em `repositories`.
- Testes de comportamento cobrindo os fluxos principais da API.

## Escopo atual

- A documentação atual cobre o back-end da aplicação.
- A pasta `frontend` existe, mas ainda não define uma implementação relevante para documentação funcional.
