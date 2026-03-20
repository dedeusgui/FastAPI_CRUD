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

- [ ] Evitar misturar rotas `async def` com código de banco totalmente síncrono.
      `app/user/routes/user_route.py:13`, `app/tasks/routes/task_route.py:12`
      Essas rotas são declaradas como async, mas todo o acesso ao banco usa SQLAlchemy síncrono. Use rotas `def` comuns ou migre para uma stack de banco assíncrona.

- [ ] Revisar o requisito de versão do Python.
      `pyproject.toml:6`
      O projeto exige `>=3.14`, mas o ambiente local aqui é Python 3.12.3. Se 3.14 não foi intencional, isso está mais restritivo do que o necessário.

- [ ] Adicionar documentação básica de configuração do projeto.
      `README.md:1`
      O README está vazio. Adicione instruções de execução, variáveis de ambiente necessárias, configuração do banco e um exemplo do fluxo de autenticação.

- [ ] Adicionar testes antes de o projeto crescer.
      Projeto inteiro
      Ainda não existem testes para cadastro, login, autorização e regras de propriedade das tarefas. Essas devem ser as primeiras áreas cobertas.
