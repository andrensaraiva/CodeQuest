<p align="center">
  <img src="./CodePlatform/apps/web/src/assets/hero.png" alt="CodeQuest Academy" width="860" />
</p>

<h1 align="center">CodeQuest Academy</h1>

<p align="center">
  Plataforma educacional gamificada para escolas ensinarem programação com missões, XP, badges, rankings e relatórios de progresso.
</p>

<p align="center">
  <img alt="C# first" src="https://img.shields.io/badge/C%23_first-35ff7a?style=for-the-badge&labelColor=080b0f&color=35ff7a" />
  <img alt="Unity-ready" src="https://img.shields.io/badge/Unity--ready-22d3ee?style=for-the-badge&labelColor=080b0f&color=22d3ee" />
  <img alt="Teacher centered" src="https://img.shields.io/badge/Teacher_centered-b968ff?style=for-the-badge&labelColor=080b0f&color=b968ff" />
  <img alt="status" src="https://img.shields.io/badge/status-beta-ffd166?style=for-the-badge&labelColor=080b0f&color=ffd166" />
</p>

## Visao Geral

O **CodeQuest Academy** e uma plataforma de aprendizagem de programacao com visual dark gaming e foco escolar. A proposta e transformar exercicios de codigo em quests: o aluno aprende C#, executa testes visiveis, submete solucoes, ganha XP e desbloqueia badges; o professor acompanha progresso, tentativas, ranking da turma e pontos de dificuldade.

O ciclo principal:

1. O professor cria ou utiliza uma quest de C#.
2. O aluno abre a quest no editor Monaco.
3. O aluno executa testes visiveis ou envia a solucao completa.
4. A API compila e executa o codigo (Roslyn) ou cai no runner mock determinístico.
5. A API registra execucoes, submissoes, resultados, XP, badges e progresso.
6. O professor enxerga evolucao, exercicios dificeis e alunos que precisam de apoio.

## O Que Ja Existe

| Area | Entrega |
| --- | --- |
| Autenticacao | Cadastro, login, JWT com refresh token rotacionado, BCrypt, rate limiting nos endpoints `/auth/*` |
| Aprendizagem | Trilhas, modulos, aulas, exercicios, testes visiveis e ocultos |
| Editor | Monaco Editor com lazy load, painel de configuracoes por aluno (fonte, tema, fundo, tab, minimapa, quebra de linha, animacoes), 6 temas customizados, autocomplete C# com snippets cientes do exercicio e botao basico de formatacao |
| Dicas | Sistema de dicas progressivas (4 niveis + revelacao opcional da solucao) com penalidade de XP configuravel pelo professor e UI de confirmacao |
| Correcao | `RoslynCodeRunnerService` (compilação real, timeout, allowlist de APIs) ou `MockCodeRunnerService`, selecionável por `CodeRunner:Provider` |
| Gamificacao | XP, niveis, badges, ranking, awards protegidos por transação |
| Idiomas | Interface bilingue com PT-BR como idioma inicial e EN-US como alternativa |
| Tema | Alternancia de modo Noite/Dia persistida no navegador |
| Professor | Dashboard, turmas, detalhe da turma, builder de exercicios e relatorios |
| Aluno | Dashboard, mapa de aprendizagem, aulas, exercicios, badges, ranking, editor Monaco customizavel e dicas progressivas com penalidade de XP |
| Dados | EF Core, SQLite para desenvolvimento local e PostgreSQL via Docker, índices em colunas quentes |
| Qualidade | FluentValidation em todos os DTOs, Serilog estruturado, `ProblemDetails` em erros, `ErrorBoundary` no React |
| Testes | xUnit + EF InMemory no backend, Vitest + Testing Library no frontend |
| CI | GitHub Actions roda build, lint e testes em cada push/PR |
| Documentacao | Guias de arquitetura, API, banco, frontend, backend, runner, Unity e continuidade |

## Experiencia Do Produto

### Para alunos

- Dashboard com XP, nivel, badges e quest atual.
- Mapa de aprendizagem com modulos e progresso.
- Aulas e exercicios de C# orientados a logica de jogos.
- Editor Monaco customizavel: 6 temas (CodeQuest Dark, Neon Dungeon, Cyber Academy, Forest Terminal, Classic Dark, Light Mode), 6 fundos, fontes, tab size, minimapa, quebra de linha, animacoes reduzidas e autocomplete C# com snippets cientes do exercicio.
- Sistema de dicas progressivas: o aluno pode desbloquear dicas em niveis crescentes, mas cada nivel reduz o XP maximo da quest. O painel exibe o XP possivel em tempo real.
- Botao **Executar** para testes visiveis.
- Botao **Enviar** para todos os testes e ganho de XP (descontado quando dicas foram usadas).
- Feedback visual de execucao/envio, erros de API e historico de tentativas (paginado).
- Ranking positivo da turma, sem exposicao punitiva.

### Para professores

- Dashboard com turmas, alunos, submissoes e exercicios dificeis.
- Criacao e visualizacao de turmas com codigo de convite gerado por `RandomNumberGenerator`.
- Builder de exercicios C#.
- Relatorios de progresso e alunos que precisam de suporte.
- Acesso a submissoes restrito ao professor dono do exercicio/turma.
- Base pronta para evoluir para editor completo de testes e atribuicao de trilhas por turma.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4, React Router 7, TanStack Query, Zustand, Monaco Editor, lucide-react |
| Backend | ASP.NET Core 9, EF Core, JWT + refresh tokens, BCrypt, FluentValidation, Serilog, Rate Limiting |
| Banco | SQLite no desenvolvimento, PostgreSQL para ambiente mais proximo de producao |
| Runner | `MockCodeRunnerService` (default) ou `RoslynCodeRunnerService` (real, opt-in) |
| Testes | xUnit, FluentAssertions, EF InMemory, Vitest, Testing Library, jsdom |
| Infra local | Docker Compose para PostgreSQL |
| CI | GitHub Actions |

## Arquitetura

```text
CodeQuest
├─ CodeQuest.sln
├─ README.md
├─ .github/workflows/ci.yml
└─ CodePlatform
   ├─ apps
   │  ├─ api        # ASP.NET Core Web API
   │  ├─ web        # React/Vite frontend
   │  └─ tests      # xUnit (CodeQuest.Api.Tests)
   ├─ docs          # Documentacao do produto e da implementacao
   ├─ packages      # Espaco reservado para compartilhamentos futuros
   └─ docker-compose.yml
```

### Backend

Os controllers funcionam como adaptadores HTTP finos. As regras ficam nos services:

- `AuthService`: cadastro, login, JWT, refresh tokens (SHA256 hash, rotacao single-use, 30 dias).
- `ClassroomService`: turmas, convites criptograficamente seguros, alunos e progresso.
- `LearningService`: trilhas, modulos, aulas e exercicios.
- `CodeSubmissionService`: execucao, submissao, paginacao, checagem de matricula e propriedade.
- `MockCodeRunnerService` / `RoslynCodeRunnerService`: runners selecionaveis.
- `GamificationService`: XP, niveis, badges e ranking, com transacao para evitar duplicacao.
- `ReportService`: progresso de turma e dificuldade.
- `AssistantService`: respostas placeholder para IA.

Cross-cutting: `FluentValidation` em todos os DTOs, `UseExceptionHandler` mapeando excecoes para `ProblemDetails`, `Serilog` para logs estruturados, rate limit `auth` (10 req/min/IP), CORS configuravel via `Cors:AllowedOrigins`.

### Frontend

O frontend e organizado por features:

- `features/auth`: landing, login e registro.
- `features/student`: dashboard, mapa, modulo, aula, exercicio, badges e ranking.
- `features/teacher`: dashboard, turmas, builder e relatorios.
- `components/layout`: `AppShell` e `ErrorBoundary` no topo da arvore.
- `components/preferences`: controles de idioma e tema.
- `components/ui`: primitives visuais alinhadas ao tema dark/neon.
- `i18n/preferences.tsx`: provider de preferencias, dicionarios PT-BR/EN-US e traducao do conteudo demo.
- `api/client.ts`: cliente tipado com retry automatico em 401 (refresh) e queda para `/login`.
- `stores/authStore.ts`: sessao persistida com access token + refresh token + user.

O Monaco e carregado via `React.lazy` + `Suspense`, fora do bundle inicial.

### Idioma E Tema

A aplicacao inicia em **PT-BR** e pode trocar para **EN-US** na landing, login e area autenticada. A preferencia fica em `localStorage`. O tema alterna entre **Noite** e **Dia** via tokens CSS.

### Corretor Real

- `POST /code/run` executa os testes visiveis da quest.
- `POST /code/submit` executa todos os testes, registra a tentativa e concede XP.

Por padrao o backend usa o runner mock. Para ativar o runner real:

```powershell
cd CodePlatform/apps/api
dotnet user-secrets set "CodeRunner:Provider" "Roslyn"
```

O runner Roslyn aplica timeout (`CodeRunner:TimeoutSeconds`, default 5s), restringe imports a `System`, `System.Linq`, `System.Collections.Generic`, `System.Text` e `System.Math`, e bloqueia tokens como `System.IO`, `System.Net`, `Process`, `Reflection`, `Runtime.InteropServices`, `Thread`, `AppDomain`, `File.`, `Directory.`, `DllImport` e `unsafe`. Ele **nao** e um sandbox completo — para codigo de fora da sala de aula use Judge0 ou Docker workers.

## Como Rodar Sem Docker

O ambiente de desenvolvimento usa SQLite por padrao.

### 1. API

```powershell
cd CodePlatform/apps/api
dotnet restore
dotnet run --launch-profile http
```

A API cria `CodePlatform/apps/api/codequest-dev.db` automaticamente, aplica `EnsureCreated` e popula dados de demonstracao.

Swagger: `http://localhost:5000/swagger`
Health: `http://localhost:5000/health`

### 2. Web

```powershell
cd CodePlatform/apps/web
npm install
npm run dev
```

Aplicacao: `http://localhost:5173`

## Como Rodar Com Docker E PostgreSQL

```powershell
cd CodePlatform
docker compose up -d

cd apps/api
dotnet user-secrets set "Database:Provider" "Postgres"
dotnet restore
dotnet run --launch-profile http
```

```powershell
cd CodePlatform/apps/web
npm install
npm run dev
```

> A tabela `RefreshTokens` foi adicionada apos a migration inicial. Antes do primeiro deploy em Postgres, gere uma nova migration (veja `docs/DATABASE.md`).

## Testes

```powershell
# Backend
dotnet test CodeQuest.sln

# Frontend
cd CodePlatform/apps/web
npm test
```

## Contas Demo

| Perfil | Email | Senha |
| --- | --- | --- |
| Professor | `teacher@codequest.dev` | `password123` |
| Aluno 1 | `student1@codequest.dev` | `password123` |
| Aluno 2 | `student2@codequest.dev` | `password123` |
| Aluno 3 | `student3@codequest.dev` | `password123` |
| Aluno 4 | `student4@codequest.dev` | `password123` |
| Aluno 5 | `student5@codequest.dev` | `password123` |

Codigo de convite da turma demo: `JOGOS2026`

## Rotas Principais

| Area | Rotas |
| --- | --- |
| Publico | `/`, `/login` |
| Aluno | `/student`, `/student/map`, `/student/modules/:moduleId`, `/student/lessons/:lessonId`, `/student/exercises/:exerciseId`, `/student/badges`, `/student/ranking` |
| Professor | `/teacher`, `/teacher/classes`, `/teacher/classes/:classId`, `/teacher/builder`, `/teacher/reports` |
| Futuro | `/unity`, `/admin` |

## API

Base local: `http://localhost:5000`. Erros seguem `application/problem+json`.

| Grupo | Exemplos |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Classes | `GET /classes`, `POST /classes`, `POST /classes/join`, `GET /classes/{id}/report` |
| Learning | `GET /tracks`, `GET /modules/{id}`, `POST /exercises`, `POST /exercises/{id}/publish` |
| Code | `POST /code/run`, `POST /code/submit` |
| Submissions | `GET /submissions/me?page=1&pageSize=25`, `GET /submissions/exercises/{exerciseId}`, `GET /submissions/classes/{classroomId}` |
| Hints | `GET /exercises/{id}/hints`, `POST /exercises/{id}/hints/{hintId}/unlock` |
| Editor | `GET /me/editor-settings`, `PUT /me/editor-settings` |
| Gamification | `GET /me/xp`, `GET /me/badges` |
| AI (mock) | `POST /ai/hint`, `POST /ai/generate-exercise`, `POST /ai/generate-tests` |
| Ops | `GET /health` |

## Comandos Uteis

```powershell
dotnet build CodeQuest.sln
dotnet test CodeQuest.sln
npm --prefix CodePlatform/apps/web run build
npm --prefix CodePlatform/apps/web run lint
npm --prefix CodePlatform/apps/web test
```

Criar uma migration PostgreSQL:

```powershell
dotnet tool run dotnet-ef migrations add NomeDaMigration `
  --project CodePlatform/apps/api/CodeQuest.Api.csproj `
  --startup-project CodePlatform/apps/api/CodeQuest.Api.csproj `
  -o Migrations
```

## Documentacao

| Documento | Conteudo |
| --- | --- |
| `CodePlatform/docs/PROJECT_OVERVIEW.md` | Visao do produto e escopo |
| `CodePlatform/docs/ARCHITECTURE.md` | Estrutura do monorepo, backend e frontend |
| `CodePlatform/docs/SETUP.md` | Setup local com SQLite ou PostgreSQL |
| `CodePlatform/docs/API.md` | Endpoints disponiveis |
| `CodePlatform/docs/DATABASE.md` | Modelo de dados e estrategia de migracao |
| `CodePlatform/docs/CODE_RUNNER.md` | Runner Roslyn/Mock e caminhos para Judge0/Docker |
| `CodePlatform/docs/DESIGN_SYSTEM.md` | Paleta, componentes e direcao visual |
| `CodePlatform/docs/STUDENT_GUIDE.md` | Fluxo do aluno |
| `CodePlatform/docs/TEACHER_GUIDE.md` | Fluxo do professor |
| `CodePlatform/docs/UNITY_SUPPORT.md` | Plano de suporte Unity |
| `CodePlatform/docs/EDITOR_EXPERIENCE.md` | Customizacao do editor Monaco, temas, fundos, snippets e fontes |
| `CodePlatform/docs/HINT_SYSTEM.md` | Niveis de dicas, calculo de penalidade de XP e configuracao por professor |
| `CodePlatform/docs/ROADMAP.md` | Proximas fases e hardening |
| `CodePlatform/docs/CONTINUATION_GUIDE.md` | Guia para continuidade do desenvolvimento |

## Estado Atual E Limitacoes

- O runner Mock e o default; o runner Roslyn e opt-in via `CodeRunner:Provider=Roslyn`. Roslyn nao e sandbox completo.
- As features de IA sao placeholders estaticos/rule-based.
- Unity esta documentado e possui rota placeholder, mas nao executa analise real ainda.
- Admin e um scaffold.
- A atribuicao de trilhas especificas por turma ainda deve virar tabela propria.
- O builder de professor cria exercicios simples; o editor completo de testes visiveis/ocultos e a proxima evolucao natural.
- A tabela `RefreshTokens` precisa de uma migration nova antes de subir em Postgres.
- O builder de professor ainda nao tem UI para criar dicas. A API ja aceita um array `Hints` no `CreateExerciseRequest`, e o seeder gera 4 dicas demo automaticamente para os exercicios padrao.
- O `IntegrityTracker` no front coleta paste/keystroke/timing localmente, mas a transmissao para o backend e os signals de integridade serao implementados na Fase 4.
- Apos puxar a atualizacao de maio/2026, apague `apps/api/codequest-dev.db` uma vez antes de subir o backend para que `EnsureCreated` recrie o schema com as novas tabelas (`ExerciseHints`, `StudentHintUnlocks`, `StudentEditorSettings`) e as novas colunas em `Exercises`/`Submissions`. Em Postgres, gere a migration `HintsAndEditorSettings`.

## Roadmap Curto

Veja [`CodePlatform/docs/ROADMAP.md`](CodePlatform/docs/ROADMAP.md) para a lista completa. Itens recem-concluidos: runner Roslyn, refresh tokens, FluentValidation, paginacao, rate limiting, Serilog, ErrorBoundary, lazy Monaco, suite de testes, pipeline CI.

## Identidade Visual

A interface segue uma direcao **gaming/community UI** com modo Noite nativo e modo Dia opcional:

| Token | Cor |
| --- | --- |
| Background noite | `#080b0f` |
| Surface noite | `#101720` |
| Background dia | `#f5f8f6` |
| Surface dia | `#ffffff` |
| Primary accent | `#35ff7a` |
| Secondary accents | cyan e purple |
| Warning | yellow |
| Error | pink/red |

O objetivo visual e deixar a plataforma com clima de quest, progresso e conquista, sem perder clareza para uso recorrente em sala de aula.
