# Checklist de Revisão de Código

Este projeto é um ponto de partida razoável, mas existem alguns problemas de segurança e corretude que devem ser corrigidos antes de construir mais funcionalidades sobre ele.

## Crítico

- [x] Proteger corretamente a propriedade das tarefas.
      `app/tasks/routes/task_route.py:20`, `app/tasks/routes/task_route.py:28`, `app/tasks/schemas/tasks.py:4`
      A API confia no `user_id` vindo do corpo da requisição/query string. Um cliente pode criar ou concluir tarefas de outro usuário apenas enviando um `user_id` diferente.

- [x] Proteger os endpoints de usuário com autenticação/autorização.
      `app/user/routes/user_route.py:44`, `app/user/routes/user_route.py:53`, `app/user/routes/user_route.py:64`
      Qualquer cliente pode buscar, atualizar ou remover qualquer usuário pelo ID. Não há verificação de que o solicitante é o próprio usuário ou um administrador.

- [x] Tratar tokens inválidos sem retornar erro 500.
      `config/dependencies.py:38`, `app/user/services/auth_service.py:16`, `app/user/routes/user_route.py:35`, `app/tasks/routes/task_route.py:12`
      `get_current_user()` pode retornar `None`, e as rotas depois acessam `current_user.id` ou `user.id`. Tokens inválidos/expirados devem retornar `401`, não causar falha na aplicação.

- [fazer depois] Remover segredos do código-fonte.
  `config/database.py:4`, `app/user/services/auth_service.py:12`, `app/user/services/auth_service.py:17`
  A senha do banco de dados e o segredo JWT estão fixos no repositório. Mova esses valores para variáveis de ambiente ou para um arquivo de configuração que não seja versionado.

- [x] Corrigir atualizações parciais de usuário para não sobrescrever campos obrigatórios com `None`.
      `app/user/services/user_service.py:21`, `app/user/repositories/user_repository.py:24`
      `PATCH /users/{id}` monta um objeto `User` completo com possíveis valores `None`. Enviar apenas um campo pode apagar o outro e causar dados inválidos ou erros no banco.

## Importante

- [x] Adicionar tratamento para email duplicado no cadastro.
      `app/user/services/user_service.py:10`, `app/user/routes/user_route.py:13`
      O cadastro não verifica se o email já existe. No estado atual, isso provavelmente falhará na camada do banco e retornará uma mensagem de exceção bruta.

- [x] Parar de capturar exceções genéricas na rota de cadastro.
      `app/user/routes/user_route.py:17`
      `except Exception` esconde o tipo real do erro e pode expor erros internos do banco diretamente na resposta HTTP.

- [x] Manter a rota de tarefas usando a camada de serviço de forma consistente.
      `app/tasks/routes/task_route.py:13`
      `get_tasks()` injeta `get_task_repository` em vez de `get_task_service`. Isso contorna a camada de serviço e deixa a arquitetura inconsistente.

- [x] Corrigir o contrato da API de atualização de tarefas.
      `app/tasks/schemas/tasks.py:10`, `app/tasks/routes/task_route.py:37`
      `TaskUpdate` exige `completed`, mas a rota ignora esse campo completamente. O schema diz uma coisa, e o comportamento do endpoint faz outra.

- [x] Fazer com que schemas de PATCH sejam realmente parciais.
      `app/tasks/schemas/tasks.py:10`, `app/user/schemas/user.py:15`
      `TaskUpdate` exige campos que uma requisição PATCH normalmente deveria permitir omitir. O schema de PATCH de usuário já é parcial; o de tarefas deve seguir a mesma ideia.

- [x] Substituir o estilo de configuração do Pydantic v1 obsoleto nos schemas de tarefas.
      `app/tasks/schemas/tasks.py:23`
      O projeto depende de Pydantic v2, mas `TaskRead` ainda usa `class Config: orm_mode = True`. Prefira `model_config = {"from_attributes": True}`.

- [fazer depois] Não criar tabelas do banco no momento da importação.
  `app/main.py:8`
  `Base.metadata.create_all()` é executado assim que o módulo é importado. Isso é frágil em produção e dificulta migrações. Use Alembic ou etapas explícitas de inicialização/migração.

- [x] Validar entidades relacionadas ao criar tarefas.
      `app/tasks/services/task_service.py:11`
      A criação de tarefas não verifica se o usuário de destino existe. Combinado com o `user_id` fornecido pelo cliente, isso aumenta a chance de dados inválidos ou erros de integridade.

- [x] Usar uma única configuração de OAuth em vez de redefini-la nas rotas.
      `config/dependencies.py:11`, `app/user/routes/user_route.py:8`, `app/tasks/routes/task_route.py:7`
      `OAuth2PasswordBearer` está duplicado, e a rota de tarefas ainda usa um `tokenUrl` diferente (`"token"`). Mantenha isso centralizado.

## Limpeza / Manutenibilidade

- [x] Evitar misturar rotas `async def` com código de banco totalmente síncrono.
      `app/user/routes/user_route.py:13`, `app/tasks/routes/task_route.py:12`
      Essas rotas são declaradas como async, mas todo o acesso ao banco usa SQLAlchemy síncrono. Use rotas `def` comuns ou migre para uma stack de banco assíncrona.

- [x] Revisar o requisito de versão do Python.
      `pyproject.toml:6`
      O projeto exige `>=3.14`, mas o ambiente local aqui é Python 3.12.3. Se 3.14 não foi intencional, isso está mais restritivo do que o necessário.

- [faremos em breve ] Adicionar documentação básica de configuração do projeto.
  `README.md:1`
  O README está vazio. Adicione instruções de execução, variáveis de ambiente necessárias, configuração do banco e um exemplo do fluxo de autenticação.

- [ ] Criar suíte de testes mínima para garantir regressão zero nas regras de autenticação e propriedade.
      Projeto inteiro
      Os arquivos de teste existem, mas estão vazios. Abaixo está o TODO recomendado para implementar por prioridade.

## TODO de Testes (o que implementar e por que)

### Prioridade 1 - Autenticação e autorização

- [x] `POST /users/register` deve cadastrar usuário com dados válidos (retornar 200 e mensagem de sucesso).
      Por que: garante o fluxo base de entrada de novos usuários.

- [x] `POST /users/register` deve falhar com email já cadastrado (retornar 400 com "Email already registered").
      Por que: evita regressão na regra de unicidade de email.

- [x] `POST /users/login` deve retornar `access_token`
      Por que: valida o fluxo principal de login.

- [ ] `POST /users/login` deve retornar 401 para senha inválida.
      Por que: garante bloqueio de credenciais incorretas.

- [ ] `POST /users/login` deve retornar 401 para email inexistente.
      Por que: confirma comportamento seguro para usuários não cadastrados.

- [ ] `GET /users/me` deve retornar dados do usuário quando token é válido.
      Por que: valida extração de identidade a partir do JWT.

- [ ] `GET /users/me` deve retornar 401 sem token.
      Por que: garante que endpoint protegido não fique público.

- [ ] `GET /users/me` deve retornar 401 com token inválido/expirado.
      Por que: evita regressões de segurança no middleware de autenticação.

### Prioridade 2 - Regras de tarefas por dono

- [ ] `POST /tasks/create` deve criar tarefa vinculada ao usuário autenticado.
      Por que: evita confiar em `user_id` vindo do cliente e garante ownership correto.

- [ ] `GET /tasks/` deve listar somente tarefas do usuário autenticado.
      Por que: impede vazamento de dados entre usuários.

- [ ] `POST /tasks/complete/{id}` deve permitir completar tarefa do próprio usuário.
      Por que: cobre o fluxo de sucesso da regra de domínio.

- [ ] `POST /tasks/complete/{id}` deve retornar 403 ao tentar completar tarefa de outro usuário.
      Por que: valida isolamento entre contas.

- [ ] `POST /tasks/complete/{id}` deve retornar 404 para tarefa inexistente.
      Por que: assegura tratamento correto de recurso não encontrado.

- [ ] `PATCH /tasks/update/{id}` deve atualizar `title` e `description` de tarefa própria.
      Por que: cobre atualização parcial e persistência de campos.

- [ ] `PATCH /tasks/update/{id}` deve permitir atualizar só um campo (ex.: só `title`).
      Por que: evita regressão em comportamento de PATCH parcial.

- [ ] `PATCH /tasks/update/{id}` deve retornar 403 para tarefa de outro usuário.
      Por que: reforça autorização por dono.

- [ ] `DELETE /tasks/delete/{id}` deve excluir tarefa própria.
      Por que: cobre operação destrutiva com sucesso.

- [ ] `DELETE /tasks/delete/{id}` deve retornar 403 para tarefa de outro usuário.
      Por que: evita deleção indevida entre usuários.

- [ ] Endpoints de tarefas devem retornar 401 sem token e com token inválido.
      Por que: garante proteção de todas as rotas protegidas.

### Prioridade 3 - Validações de entrada e contratos de API

- [ ] `POST /users/register` deve retornar 422 para senha com menos de 6 caracteres.
      Por que: garante aplicação das regras declaradas no schema.

- [ ] `POST /users/login` deve retornar 422 para payload inválido (email malformado, campos ausentes).
      Por que: evita aceitação de dados inconsistentes no login.

- [ ] `POST /tasks/create` deve retornar 422 sem `title`.
      Por que: valida contrato mínimo do schema `TaskCreate`.

- [ ] `PATCH /tasks/update/{id}` deve aceitar payload vazio sem erro 500.
      Por que: protege contra regressão em cenários de atualização parcial sem campos.

### Prioridade 4 - Testes unitários de serviço (mais rápidos)

- [ ] `UserService.register_user` deve gerar hash e chamar `create_user`.
      Por que: valida regra de negócio sem dependência HTTP.

- [ ] `UserService.register_user` deve lançar `ValueError` para email duplicado.
      Por que: confirma regra crítica de negócio antes da camada web.

- [ ] `TaskService.complete_task/update_task/delete_task` deve lançar 403 quando `task.user_id != user_id`.
      Por que: garante regra central de autorização na camada de domínio.

- [ ] `TaskService.complete_task/update_task/delete_task` deve lançar 404 para tarefa inexistente.
      Por que: garante consistência do tratamento de erro.

### Prioridade 5 - Testes de infraestrutura de teste

- [ ] Criar fixture de banco isolado para testes (transação rollback por teste ou SQLite em memória).
      Por que: evita dependência do Postgres local e torna os testes repetíveis.

- [ ] Criar fixture de usuário autenticado + helper para gerar token.
      Por que: reduz duplicação e acelera escrita dos testes de rotas protegidas.

- [ ] Garantir limpeza de estado entre testes (sem vazamento de dados).
      Por que: elimina testes flakey e resultados não determinísticos.
