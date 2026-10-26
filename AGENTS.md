# Guia do agente — Lumiere

## Visão do projeto

Lumiere conecta doadores e leitores para doação ou troca de livros. O frontend Angular consome a API REST do backend Spring Boot. A sessão fica no navegador; o backend não autentica as requisições seguintes.

O `README.md` descreve o produto. Ele cita Docker e MySQL, mas o repositório não tem Dockerfile, Compose nem driver MySQL. O banco usado é SQL Server.

## Mapa do repositório

- `frontend/` — aplicação Angular 21. Ler `frontend/AGENTS.md` antes de editar.
- `backend/` — API Spring Boot 3.4.3 / Java 17. Ler `backend/AGENTS.md` antes de editar.
- `backend/Lumiere` — gitlink (modo 160000, commit `d2a2501`) sem `.gitmodules` e sem código no working tree. Não é a aplicação. Não editar.
- `backend/uploads/usuarios/` — fotos de usuários já versionadas. Não adicionar novas fotos.

## Arquitetura e fluxo

1. O frontend em `http://localhost:4200` chama `http://localhost:8081` direto. `frontend/angular.json` não define proxy.
2. `POST /login` devolve `UsuarioDTO` (id, nome, descrição, foto). O frontend grava isso em `localStorage`, chave `usuarioLogado`.
3. As outras chamadas mandam o id do usuário na URL. Não há token, guard de rota nem interceptor.
4. `POST /interesse` cria status `PENDENTE`. `POST /interesse/{id}/criarChat` marca `ACEITO` e tira o livro de disponível. A criação do chat é um TODO: `Conversa` e `Mensagem` existem, mas não há API de mensagens, e a página `chat` não chama o backend.
5. Hibernate está com `ddl-auto=update` no banco local `biblioteca_comunitaria`. Alterar entidade muda esse banco na próxima subida.
6. `/admin` lista métricas e gere pessoas e livros. O link só aparece se `UsuarioDTO.administrador` for verdadeiro. Se não houver administrador, o próximo login bem-sucedido vira o primeiro.

## Comandos

Rodar no diretório indicado. O frontend declara npm; não usar Bun neste repositório.

- `frontend/`: `npm install`, `npm start`, `npm run build`, `npm test`
- `backend/`: `./mvnw spring-boot:run`, `./mvnw -DskipTests compile`

## Convenções

- Manter os nomes de domínio em português, como `Livro`, `Interesse` e `Usuario`. Não renomear identificadores para inglês nem para acrescentar acento.
- Texto visível ao usuário em português, com acentos corretos.
- Não copiar credenciais de `backend/src/main/resources/application.properties` para instruções, logs, commits ou exemplos.
- Não adicionar Spring Security, JWT, Flyway ou Docker sem pedido explícito. Eles não existem aqui e mudam o contrato atual.
- A origem CORS permitida é só `http://localhost:4200`, em `WebConfig` e em cada `@CrossOrigin`. Uma origem nova precisa dos dois lugares.

## Validação

- Frontend: `npm run build` em `frontend/`.
- Backend sem banco: `./mvnw -DskipTests compile` em `backend/`.
- `./mvnw test` exige SQL Server em `localhost:1433` e aplica `ddl-auto=update`. Não rodar sem pedido.

## Mapa de instruções

- `frontend/AGENTS.md` — rotas, sessão local e comandos npm.
- `backend/AGENTS.md` — camadas da API, SQL Server, uploads e Maven.
