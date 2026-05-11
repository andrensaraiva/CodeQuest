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
  <img alt="MVP" src="https://img.shields.io/badge/status-MVP-ffd166?style=for-the-badge&labelColor=080b0f&color=ffd166" />
</p>

## Visao Geral

O **CodeQuest Academy** e um MVP de uma plataforma de aprendizagem de programacao com visual dark gaming e foco escolar. A proposta e transformar exercicios de codigo em quests: o aluno aprende C#, executa testes visiveis, submete solucoes, ganha XP e desbloqueia badges; o professor acompanha progresso, tentativas, ranking da turma e pontos de dificuldade.

O MVP valida este ciclo:

1. O professor cria ou utiliza uma quest de C#.
2. O aluno abre a quest no editor Monaco.
3. O aluno executa testes visiveis ou envia a solucao completa.
4. A API registra execucoes, submissoes, resultados, XP, badges e progresso.
5. O professor enxerga evolucao, exercicios dificeis e alunos que precisam de apoio.

## O Que Ja Existe

| Area | Entrega |
| --- | --- |
| Autenticacao | Cadastro, login, sessao persistida e JWT para alunos/professores |
| Aprendizagem | Trilhas, modulos, aulas, exercicios, testes visiveis e ocultos |
| Editor | Monaco Editor no fluxo de exercicios |
| Correcao | Runner mockado por `ICodeRunnerService`, pronto para substituicao por Judge0, Docker workers ou cloud runners |
| Gamificacao | XP, niveis, badges, ranking e eventos de progresso |
| Professor | Dashboard, turmas, detalhe da turma, builder de exercicios e relatorios |
| Aluno | Dashboard, mapa de aprendizagem, aulas, exercicios, badges e ranking |
| Dados | EF Core, SQLite para desenvolvimento local e PostgreSQL via Docker |
| Documentacao | Guias de arquitetura, API, banco, frontend, backend, runner, Unity e continuidade |

## Experiencia Do Produto

### Para alunos

- Dashboard com XP, nivel, badges e quest atual.
- Mapa de aprendizagem com modulos e progresso.
- Aulas e exercicios de C# orientados a logica de jogos.
- Botao **Run** para testes visiveis.
- Botao **Submit** para todos os testes e ganho de XP.
- Ranking positivo da turma, sem exposicao punitiva.

### Para professores

- Dashboard com turmas, alunos, submissoes e exercicios dificeis.
- Criacao e visualizacao de turmas com codigo de convite.
- Builder de exercicios C#.
- Relatorios de progresso e alunos que precisam de suporte.
- Base pronta para evoluir para editor completo de testes e atribuicao de trilhas por turma.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Zustand, Monaco Editor, Lucide React |
| Backend | ASP.NET Core Web API, .NET 9, EF Core, JWT, BCrypt |
| Banco | SQLite no desenvolvimento rapido, PostgreSQL para ambiente mais proximo de producao |
| Runner | `ICodeRunnerService` com implementacao mockada no MVP |
| Infra local | Docker Compose para PostgreSQL |

## Arquitetura

```text
CodeQuest
├─ CodeQuest.sln
├─ README.md
└─ CodePlatform
   ├─ apps
   │  ├─ api        # ASP.NET Core Web API
   │  └─ web        # React/Vite frontend
   ├─ docs          # Documentacao do produto e da implementacao
   ├─ packages      # Espaco reservado para compartilhamentos futuros
   └─ docker-compose.yml
```

### Backend

Os controllers funcionam como adaptadores HTTP finos. As regras ficam nos services:

- `AuthService`: cadastro, login, JWT e BCrypt.
- `ClassroomService`: turmas, convites, alunos e progresso.
- `LearningService`: trilhas, modulos, aulas e exercicios.
- `CodeSubmissionService`: execucao, submissao e armazenamento de tentativas.
- `MockCodeRunnerService`: simulacao segura do runner no MVP.
- `GamificationService`: XP, niveis, badges e ranking.
- `ReportService`: progresso de turma e dificuldade.
- `AssistantService`: respostas placeholder para IA.

### Frontend

O frontend e organizado por features:

- `features/auth`: landing, login e registro.
- `features/student`: dashboard, mapa, modulo, aula, exercicio, badges e ranking.
- `features/teacher`: dashboard, turmas, builder e relatorios.
- `components/ui`: primitives visuais alinhadas ao tema dark/neon.
- `api/client.ts`: cliente tipado para a API.
- `stores/authStore.ts`: sessao persistida.

## Como Rodar Sem Docker

O ambiente de desenvolvimento usa SQLite por padrao, entao nao precisa subir PostgreSQL para testar.

### 1. API

```powershell
cd CodePlatform/apps/api
dotnet restore
dotnet run --launch-profile http
```

A API cria `CodePlatform/apps/api/codequest-dev.db` automaticamente e popula dados de demonstracao.

Swagger:

```text
http://localhost:5000/swagger
```

### 2. Web

Em outro terminal:

```powershell
cd CodePlatform/apps/web
npm install
npm run dev
```

Aplicacao:

```text
http://localhost:5173
```

## Como Rodar Com Docker E PostgreSQL

```powershell
cd CodePlatform
docker compose up -d
```

Depois:

```powershell
cd apps/api
dotnet user-secrets set "Database:Provider" "Postgres"
dotnet restore
dotnet run --launch-profile http
```

Em outro terminal:

```powershell
cd CodePlatform/apps/web
npm install
npm run dev
```

Enquanto `Database:AutoMigrate` estiver `true`, a API aplica migracoes e popula os dados iniciais ao iniciar.

## Contas Demo

| Perfil | Email | Senha |
| --- | --- | --- |
| Professor | `teacher@codequest.dev` | `password123` |
| Aluno 1 | `student1@codequest.dev` | `password123` |
| Aluno 2 | `student2@codequest.dev` | `password123` |
| Aluno 3 | `student3@codequest.dev` | `password123` |
| Aluno 4 | `student4@codequest.dev` | `password123` |
| Aluno 5 | `student5@codequest.dev` | `password123` |

Codigo de convite da turma demo:

```text
JOGOS2026
```

## Rotas Principais

| Area | Rotas |
| --- | --- |
| Publico | `/`, `/login` |
| Aluno | `/student`, `/student/map`, `/student/modules/:moduleId`, `/student/lessons/:lessonId`, `/student/exercises/:exerciseId`, `/student/badges`, `/student/ranking` |
| Professor | `/teacher`, `/teacher/classes`, `/teacher/classes/:classId`, `/teacher/builder`, `/teacher/reports` |
| Futuro | `/unity`, `/admin` |

## API

Base local:

```text
http://localhost:5000
```

Grupos de endpoints:

| Grupo | Exemplos |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Classes | `GET /classes`, `POST /classes`, `POST /classes/join`, `GET /classes/{id}/report` |
| Learning | `GET /tracks`, `GET /modules/{id}`, `POST /exercises`, `POST /exercises/{id}/publish` |
| Code | `POST /code/run`, `POST /code/submit` |
| Submissions | `GET /submissions/me`, `GET /submissions/exercises/{exerciseId}` |
| Gamification | `GET /me/xp`, `GET /me/badges` |
| AI | `POST /ai/hint`, `POST /ai/generate-exercise`, `POST /ai/generate-tests` |

## Comandos Uteis

```powershell
dotnet build CodePlatform/apps/api/CodeQuest.Api.csproj
npm --prefix CodePlatform/apps/web run build
npm --prefix CodePlatform/apps/web run lint
```

Criar uma migration PostgreSQL:

```powershell
dotnet tool run dotnet-ef migrations add NomeDaMigration --project CodePlatform/apps/api/CodeQuest.Api.csproj --startup-project CodePlatform/apps/api/CodeQuest.Api.csproj -o Migrations
```

## Documentacao

| Documento | Conteudo |
| --- | --- |
| `CodePlatform/docs/PROJECT_OVERVIEW.md` | Visao do produto e escopo do MVP |
| `CodePlatform/docs/ARCHITECTURE.md` | Estrutura do monorepo, backend e frontend |
| `CodePlatform/docs/SETUP.md` | Setup local com SQLite ou PostgreSQL |
| `CodePlatform/docs/API.md` | Endpoints disponiveis |
| `CodePlatform/docs/DATABASE.md` | Modelo de dados e estrategia de migracao |
| `CodePlatform/docs/CODE_RUNNER.md` | Runner mockado e caminhos para Judge0/Docker |
| `CodePlatform/docs/DESIGN_SYSTEM.md` | Paleta, componentes e direcao visual |
| `CodePlatform/docs/STUDENT_GUIDE.md` | Fluxo do aluno |
| `CodePlatform/docs/TEACHER_GUIDE.md` | Fluxo do professor |
| `CodePlatform/docs/UNITY_SUPPORT.md` | Plano de suporte Unity |
| `CodePlatform/docs/ROADMAP.md` | Proximas fases e hardening |
| `CodePlatform/docs/CONTINUATION_GUIDE.md` | Guia para continuidade do desenvolvimento |

## Estado Atual E Limitacoes

O CodeQuest Academy esta em estado de MVP funcional. A experiencia principal de aluno/professor existe, mas alguns pontos ainda sao intencionalmente limitados:

- O runner nao executa codigo arbitrario; ele simula testes com regras seguras para o MVP.
- As features de IA sao placeholders estaticos/rule-based.
- Unity esta documentado e possui rota placeholder, mas nao executa analise real ainda.
- Admin e um scaffold.
- A atribuicao de trilhas especificas por turma ainda deve virar tabela propria.
- O builder de professor cria exercicios simples; o editor completo de testes visiveis/ocultos e a proxima evolucao natural.

## Roadmap Curto

- Editor completo de testes para professor.
- Relacao turma-trilha.
- Permissoes mais granulares para submissoes de exercicios.
- XP por conclusao de aula.
- Streaks e badges persistentes adicionais.
- Runner real com isolamento de CPU, memoria, rede e filesystem.
- Testes de integracao e hardening de secrets.

## Identidade Visual

A interface segue uma direcao **dark gaming/community UI**:

| Token | Cor |
| --- | --- |
| Background | `#080b0f` |
| Surface | `#101720` |
| Elevated surface | `#121a23` |
| Primary accent | `#35ff7a` |
| Secondary accents | cyan e purple |
| Warning | yellow |
| Error | pink/red |

O objetivo visual e deixar a plataforma com clima de quest, progresso e conquista, sem perder clareza para uso recorrente em sala de aula.
