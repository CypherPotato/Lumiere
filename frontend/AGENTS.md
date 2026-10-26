---
description: Regras da aplicação Angular em frontend/, incluindo rotas, sessão local e comandos npm.
---

# Frontend

## Escopo

Aplicação Angular 21 em `frontend/`. TypeScript strict, componentes standalone, Prettier com `printWidth` 100 e aspas simples. Gerenciador: npm, não Bun.

Entrada: `src/main.ts` e `src/app/app.config.ts` (`provideRouter`, `provideHttpClient`). O shell `src/app/app.ts` só tem `RouterOutlet`.

## Onde editar

- Página nova: `src/app/pages/<nome>/<nome>.ts`, com HTML, CSS e spec ao lado. Sem sufixo `.component`. Registrar a rota em `src/app/app.routes.ts`.
- Admin: `src/app/pages/admin`. Criação e edição ficam na modal, com abas por sessão. Não juntar Suspender e Remover num menu.
- HTTP: serviço em `src/app/core/services/` e modelo em `src/app/core/models/`. A base `http://localhost:8081` está repetida em cada serviço. Não criar `environment` nem proxy; o projeto não usa.
- Sessão: somente `UsuarioService`, chave `usuarioLogado` no `localStorage`. Ler o id com `obterIdUsuarioLogado()`. Não criar guard, interceptor ou token.
- `src/app/core/models/interesse.ts.ts` tem extensão duplicada e é importado como `../models/interesse.ts`. Não renomear sem atualizar o import, e não criar outro arquivo assim.
- Estilo da página no CSS ao lado do componente. Estilo global em `src/styles.css`. O build de produção falha se o CSS de um componente passar de 8 kB (`angular.json`).

## Fluxo das páginas

Formulários usam `FormsModule`. Login navega para `/home`; cadastro volta para `/login`. As páginas autenticadas leem o id em `UsuarioService` e não redirecionam sozinhas quando o id é 0.

`pages/chat-component` não chama API. Aceitar interesse usa `POST /interesse/{id}/criarChat`, que ainda não cria conversa no backend.

Foto: `UsuarioService.getFotoUrl`. Avatar padrão em `public/assets/images/default-avatar.png`.

## Comandos

No diretório `frontend/`:

- Instalar: `npm install`
- Desenvolvimento: `npm start` (`ng serve`, `http://localhost:4200`)
- Build: `npm run build`
- Testes: `npm test` (`ng test`, Vitest pelo builder `@angular/build:unit-test`)

Os specs atuais só verificam criação do componente. Não criar spec novo sem pedido. Validar mudança de página com `npm run build`.

Não editar `dist/`, `.angular/` nem `node_modules/`. Não adicionar dependência sem pedido.
