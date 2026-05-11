# AI Usage

AI is scaffolded, not integrated with a real model.

`IAssistantService` supports:

- `GenerateHintAsync`
- `GenerateExerciseAsync`
- `GenerateTestsAsync`
- `GenerateClassReportAsync`

MVP behavior:

- Student hints come from `Exercise.HintsJson`.
- Teacher generation endpoints return static placeholder text.
- Interactions are logged in `AiInteractions`.

Future rules:

- Give progressive hints before solutions.
- Do not reveal full solutions unless teacher policy allows it.
- If a solution is revealed, store that fact and reduce XP or mark the attempt.
- Teachers can generate exercises, tests, variations, and reports.
