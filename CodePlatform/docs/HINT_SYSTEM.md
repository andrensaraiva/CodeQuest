# Hint System

Students can unlock progressively stronger hints during an exercise. Each unlock reduces the XP they can earn from that exercise. Designed in the May 2026 Phase 2 update.

## Hint Levels

| Level | Default penalty | Intent |
| --- | --- | --- |
| 1 | 10% | Small conceptual nudge |
| 2 | 20% | More direct guidance |
| 3 | 35% | Similar example, not the answer |
| 4 | 50% | Strong hint / partial structure |
| 5 (optional) | configurable | Solution reveal (teacher-gated) |

The teacher can change penalties per hint and decide whether the solution may be revealed.

## XP Math (MVP rule)

The platform uses the **highest hint level unlocked**, not a stacked sum. If a student unlocks Hint 1 and Hint 2, the final XP is the base XP minus 20% — not 10% + 20%.

```
finalXp = round(baseXp * (100 - max(penalty)) / 100)
```

When a hint flagged `IsSolutionReveal = true` is unlocked, the student keeps `exercise.SolutionRevealXpPercent` percent of the base reward regardless of the other hint penalties.

Backend implementation: [`HintService.ComputePenaltyAsync`](../apps/api/Services/Learning/HintService.cs) returns `(penaltyPercent, hintsUsedCount, highestHintLevel)`, called from `CodeSubmissionService.SubmitAsync` before writing the submission and before calling `GamificationService.AwardExerciseCompletionAsync` with the post-penalty XP.

## Database

- `ExerciseHint` — one row per (exercise, hint level). Fields: `Id`, `ExerciseId`, `OrderIndex`, `Title`, `Content`, `PenaltyPercent`, `IsSolutionReveal`, timestamps.
- `StudentHintUnlock` — one row per unlock, unique on `(StudentId, ExerciseId, HintId)`.
- `Submission` adds `HintsUsedCount`, `HighestHintLevelUsed`, `HintPenaltyPercent`, `XpBeforePenalty`, `XpAwarded`.
- `Exercise` adds `AllowHints`, `AllowSolutionReveal`, `SolutionRevealXpPercent`.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/exercises/{exerciseId}/hints` | Student only. Returns hint titles + locked/unlocked state. Content is only included on unlocked rows. |
| `POST` | `/exercises/{exerciseId}/hints/{hintId}/unlock` | Idempotent — re-unlocking returns the same response without duplicate rows. Refuses if hints are disabled or if the hint is a solution reveal and reveal is disabled. |

## Teacher Configuration

Per exercise:
- `AllowHints` (default true)
- `AllowSolutionReveal` (default false)
- `SolutionRevealXpPercent` (default 0)

Per hint:
- `Title`, `Content`
- `PenaltyPercent`
- `IsSolutionReveal`

`CreateExerciseRequest` accepts an optional `Hints` array. Teachers can leave it empty and the exercise will have no hints. The seeder fills demo exercises with four progressive hints automatically, plus an optional reveal on the boss exercise.

## Student UI

The HintPanel ([`HintPanel.tsx`](../apps/web/src/features/student/editor/HintPanel.tsx)) shows:

- Possible XP badge in the panel header. Green when no penalty applies, yellow once a hint is unlocked.
- One row per hint with title, level indicator, penalty, and a lock/unlock icon.
- An inline confirm prompt before each unlock with the exact XP delta (e.g. "100 XP → 80 XP").
- After unlock, the hint content appears inline and the row sticks.

The exercise top bar also surfaces the possible XP as a colored badge so students see the cost before opening the panel.

## Edge Cases

- **Already-awarded XP.** If a student earned XP on a previous successful submission and submits again, the new XP event is skipped. The submission's `XpAwarded` is then set to 0 to avoid showing fake XP on the result screen.
- **Solution reveal without permission.** The hint endpoint returns 400 if `IsSolutionReveal` is true but the exercise has `AllowSolutionReveal = false`.
- **Hints disabled per exercise.** When `AllowHints = false`, the hint list endpoint returns an empty array and the panel shows a "hints disabled" notice.

## Ethical Notes

Hints are designed as a learning aid, not a punishment system. The penalty model intentionally rewards independent effort but never blocks completion. The "solution reveal" pathway exists so a stuck student can keep moving forward and still earn partial XP — preferable to abandonment.
