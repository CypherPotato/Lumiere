---
description: Regras da API Spring Boot em backend/, incluindo camadas, SQL Server, uploads e validação Maven.
---

# Backend

## Escopo

API em `backend/src/main/java/com/biblioteca/backend`. Java 17, Spring Boot 3.4.3, Spring Web, Spring Data JPA, driver SQL Server e Lombok. Sem Spring Security.

Entrada: `BackendApplication`. Porta `8081` em `src/main/resources/application.properties`. Sem context path. Pacote novo continua em `com.biblioteca.backend`, não em `com.lumiere`.

## Camadas

- `controller/` — rotas. Uma classe por área: `/login`, `/cadastro`, `/usuarios`, `/livros`, `/interesse`, `/home`, `/admin`.
- `service/` — regra de negócio. Controller não acessa repository.
- `repository/` — `JpaRepository`, com consulta por nome de método, como em `LivroRepository`.
- `model/` — entidades. `dto/` para resposta que não deve expor `senha`. `enums/` para status, gênero e tipo de interação.
- `config/WebConfig` — CORS e publicação de `/uploads/**`.
- `tratamentoError/TratamentoExcecaoGlobal` — qualquer `RuntimeException` vira HTTP 404 com a mensagem. O cadastro depende disso hoje. Não ampliar esse handler sem pedido.

## Contrato

- `LoginService` compara a senha em texto puro. Não há hash. Não logar senha. Endpoint novo que devolve usuário usa `UsuarioDTO`, não a entidade `Usuario`, porque ela contém `senha`.
- `Livro` usa `@SQLDelete` e `@SQLRestriction("ativo = true")`. Excluir desativa a linha. As outras entidades usam delete físico.
- `Livro.usuario` é `LAZY` e `@JsonIgnore`. Nessa entidade o projeto usa getter/setter, não `@Data`. `Usuario` e `Interesse` usam `@Data`.
- `aceitarInteresse` marca `ACEITO`, grava `disponivel = false` e deixa a criação do chat como TODO. Não persistir `Conversa` ou `Mensagem` sem pedido.
- Login bem-sucedido grava `Acesso`. O primeiro login, se ninguém for administrador, marca `administrador`. Não remover esse registro: a métrica de 24 h depende dele.
- Gestão fica em `AdminController`. Suspender livro muda `disponivel`; remover usa `ativo = false`. Consultas de admin que incluem inativos são nativas, porque `@SQLRestriction` esconde esses livros.
- Foto em `UserService`: grava em `uploads/usuarios` relativo ao diretório de trabalho, com fallback para `backend/uploads/usuarios`. O banco guarda só o nome do arquivo. Iniciar a API a partir de `backend/`.
- `ddl-auto=update` altera o SQL Server local `biblioteca_comunitaria` em `localhost:1433`. Não mudar mapeamento sem necessidade. Credenciais ficam só em `application.properties`.
- O comentário do properties fala em autenticação integrada do Windows, mas o arquivo define usuário e senha. Não alterar isso sem pedido.

## Onde editar

- Endpoint novo: controller da área, ou controller no mesmo estilo (`@RestController`, `@RequestMapping`, `@CrossOrigin(origins = "http://localhost:4200")`). Repetir a origem em `WebConfig`.
- Campo persistido: entidade em `model/` e o DTO correspondente quando a resposta não for a entidade.
- Não editar o gitlink `backend/Lumiere` nem acrescentar fotos em `backend/uploads/usuarios/`.

## Comandos

No diretório `backend/`, usar o wrapper:

- Iniciar: `./mvnw spring-boot:run`
- Compilar sem testes: `./mvnw -DskipTests compile`
- Empacotar sem testes: `./mvnw -DskipTests package`
- Teste: `./mvnw test` — só `BackendApplicationTests.contextLoads`. Exige SQL Server local e aplica o schema. Não executar sem pedido.

Não há formatador Maven. Não adicionar Checkstyle.
