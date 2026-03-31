# Guia de Aperfeicoamento do Backend

## Objetivo

Este documento traduz as limitacoes atuais da API em um plano pratico de evolucao orientado ao consumo do frontend.

Foco:

- melhorar contratos HTTP
- reduzir friccao de integracao
- padronizar respostas e erros
- manter compatibilidade gradual

## Diagnostico Atual

### O que ja esta bom

- Arquitetura por camadas e dominios esta clara.
- Controle de sessao por cookie funciona para o fluxo atual.
- Cobertura de testes backend existe para fluxos principais.

### O que limita evolucao do produto

1. Respostas de mutacao pobres em tarefas.

- create, update, complete e delete nao retornam dados uteis.
- frontend precisa refazer listas completas apos toda acao.

2. Fluxo de amizade restrito por ID.

- convite exige friend_id direto.
- nao existe busca por usuario para descoberta.

3. Pendencias de amizade com pouca informacao.

- lista pendente nao traz dados de perfil do solicitante no formato ideal para UI.

4. Ausencia de endpoint agregado para dashboard.

- frontend faz varias chamadas paralelas e trata erros parciais manualmente.

5. Padrao de erro incompleto.

- detalhe textual existe, mas sem codigo de dominio padronizado.
- falta contrato unificado para erros de negocio.

6. Padrao de sucesso inconsistente entre dominios.

- parte retorna message, parte retorna entidade, parte retorna vazio.

## Principios de Evolucao

1. Nao quebrar o frontend atual de uma vez.
2. Introduzir novos contratos de forma incremental.
3. Padronizar sucesso e erro com schemas explicitos.
4. Evitar logica de apresentacao no backend.
5. Priorizar endpoints que removem gargalos reais de UX.

## Padrao Recomendado de Resposta

### Sucesso

Para operacoes de leitura:

- manter retorno do recurso ou lista de recursos

Para operacoes de mutacao:

- retornar recurso atualizado quando fizer sentido
- usar status code semantico

Sugestao de envelope opcional para mutacoes:

```json
{
  "data": { "...": "..." },
  "meta": {
    "request_id": "uuid-opcional"
  }
}
```

### Erro

Padrao recomendado:

```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found",
    "detail": null,
    "fields": []
  }
}
```

Campos:

- code: identificador estavel para front decidir UX
- message: mensagem humana
- detail: detalhe tecnico opcional
- fields: erros de validacao por campo

## Melhorias por Dominio

## 1. Auth e User

### Problemas atuais

- login e register retornam apenas message.
- frontend depende de chamada extra para obter usuario atual.

### Melhorias recomendadas

1. Retornar usuario basico no login.
2. Retornar usuario criado no register.
3. Manter /users/me como fonte de verdade de sessao.

### Contrato sugerido

POST /users/login:

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "Ana",
      "email": "ana@email.com"
    }
  }
}
```

POST /users/register:

```json
{
  "data": {
    "id": 1,
    "name": "Ana",
    "email": "ana@email.com"
  }
}
```

## 2. Tasks

### Problemas atuais

- mutacoes sem retorno de recurso.
- complete usa POST em rota dedicada; pode permanecer, mas sem payload limita UI.

### Melhorias recomendadas

1. POST /tasks/create retornar tarefa criada.
2. PATCH /tasks/update/{id} retornar tarefa atualizada.
3. POST /tasks/complete/{id} retornar tarefa concluida.
4. DELETE /tasks/delete/{id} retornar 204 ou payload minimo consistente.
5. Opcional futuro: PATCH /tasks/{id} com campo completed.

### Beneficio esperado

- frontend atualiza estado local sem refetch global.
- menor latencia percebida.

## 3. Friends

### Problemas atuais

- descoberta de usuarios inexistente.
- pendencias e status com dados insuficientes para UX rica.

### Melhorias recomendadas

1. Criar endpoint de busca de usuarios.

- GET /users/search?query=ana&limit=10

2. Enriquecer pending requests com remetente.

- incluir requester: id, name, email, avatar_url

3. Criar endpoint de sugestoes basicas de conexao (opcional).

- GET /friends/suggestions

4. Revisar resposta de status para objeto em vez de string bruta.

- de: "accepted"
- para: { "status": "accepted" }

### Contrato sugerido para pendencias

```json
[
  {
    "id": 10,
    "requester_id": 2,
    "receiver_id": 5,
    "status": "pending",
    "requester": {
      "id": 2,
      "name": "Carlos",
      "email": "carlos@email.com",
      "avatar_url": "https://..."
    }
  }
]
```

## 4. Dashboard

### Problema atual

- tela depende de varias chamadas separadas.

### Melhoria recomendada

Criar endpoint agregado:

- GET /dashboard/summary

Resposta sugerida:

```json
{
  "data": {
    "tasks": {
      "total": 12,
      "completed": 4,
      "pending": 8,
      "recent": []
    },
    "friends": {
      "active": 6,
      "pending_requests": 2,
      "recent_pending": []
    },
    "user": {
      "id": 5,
      "name": "Ana",
      "email": "ana@email.com"
    }
  }
}
```

## Padronizacao e Documentacao

## OpenAPI e exemplos

1. Definir response_model em todas as rotas relevantes.
2. Incluir exemplos de sucesso e erro por endpoint.
3. Documentar status codes esperados por caso de uso.

## Contratos de erro

1. Definir tabela de error codes por dominio.
2. Evitar mensagens dinamicas como unica chave de decisao do frontend.
3. Garantir consistencia entre servicos e testes.

## Versionamento e migracao

Opcao A:

- manter rotas atuais e adicionar novos formatos progressivamente

Opcao B:

- prefixar melhoria maior em /v2

Para este projeto, opcao A tende a ser mais simples e rapida.

## Plano de Execucao Priorizado

### Fase 1 (alto impacto, baixo risco)

1. Tasks: retornar recurso em create, update e complete.
2. Friends pending: incluir dados de requester.
3. Auth login/register: incluir usuario no retorno.
4. Documento de error codes por dominio.

### Fase 2 (alto impacto, medio esforco)

1. Users search para fluxo de convite sem ID manual.
2. Dashboard summary agregado.
3. Revisao de status endpoint para resposta objeto padronizada.

### Fase 3 (qualidade e governanca)

1. Aumentar cobertura de testes para novos contratos.
2. Consolidar padrao de responses e erros em schemas compartilhados.
3. Atualizar docs principais com contratos finais.

## Checklist de Definicao de Pronto para cada endpoint novo/ajustado

- possui request schema e response schema explicitos
- possui erros padronizados com code estavel
- possui exemplos no OpenAPI
- possui teste de sucesso e teste de erro principal
- nao quebra o frontend atual sem plano de migracao
- tem registro na documentacao de contratos

## Resultado Esperado

Com essas melhorias, o frontend passa a:

- depender menos de refetch completo
- exibir estados mais ricos e claros
- reduzir tratamentos ad hoc de erro
- evoluir UX social sem gambiarras de ID manual
- acelerar entrega de novas telas com contratos previsiveis
