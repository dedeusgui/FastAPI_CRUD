# Regras de Negócio

## Princípio geral

As regras abaixo documentam o comportamento atualmente implementado e coberto pela suíte de testes. Este arquivo não define regras futuras de produto; ele registra o estado real da aplicação hoje.

## Usuários e autenticação

- O cadastro exige `name`, `email` válido e `password` com no mínimo 6 caracteres.
- Não é permitido registrar dois usuários com o mesmo email.
- Login com email inexistente ou senha incorreta retorna `401`.
- O login cria uma sessão e grava o cookie `access_token`.
- O endpoint `/users/me` só pode ser acessado com cookie válido.
- Requisições sem cookie retornam `401` com detalhe de não autenticado.
- Requisições com cookie inválido retornam `401` com detalhe de token inválido.

## Tarefas

- Toda tarefa criada pertence ao usuário autenticado.
- A listagem de tarefas retorna apenas tarefas do usuário autenticado.
- O campo `title` é obrigatório na criação.
- `description` é opcional.
- Apenas o dono da tarefa pode concluir, editar ou remover a própria tarefa.
- Operações sobre tarefa inexistente retornam `404`.
- Tentativas de alterar tarefas de outro usuário retornam `403`.
- A edição aceita atualização parcial.
- Um `PATCH` com payload vazio não deve quebrar o fluxo da API.

## Amizades

- Não é permitido enviar solicitação de amizade para si mesmo.
- Não é permitido criar uma solicitação duplicada para a mesma relação.
- Uma nova solicitação de amizade nasce com status `pending`.
- Apenas o destinatário pode aceitar ou recusar uma solicitação recebida.
- Aceitar ou recusar uma solicitação inexistente retorna `404`.
- Solicitações só podem ser aceitas ou recusadas quando ainda estão `pending`.
- A amizade pode assumir os estados `pending`, `accepted` e `refused`.
- Apenas usuários que fazem parte da relação podem removê-la.
- Consultar pendências de amizade é permitido apenas para o próprio usuário autenticado.
- A listagem de amigos retorna apenas relações com status `accepted`.
- Consultar uma amizade inexistente retorna `404`.

## Limite intencional deste documento

- Regras ainda não implementadas não entram aqui.
- Quando uma regra mudar no código, este arquivo deve ser atualizado junto.
