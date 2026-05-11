using CodeQuest.Api.Enums;

namespace CodeQuest.Api.DTOs;

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling((double)TotalCount / PageSize);
}

public sealed record PageQuery(int Page = 1, int PageSize = 25)
{
    public int SafePage => Page < 1 ? 1 : Page;
    public int SafePageSize => PageSize is < 1 or > 200 ? 25 : PageSize;
    public int Skip => (SafePage - 1) * SafePageSize;
}

public sealed record AuthResponse(string Token, string RefreshToken, UserDto User);
public sealed record RegisterRequest(string Name, string Email, string Password, UserRole Role);
public sealed record LoginRequest(string Email, string Password);
public sealed record RefreshTokenRequest(string RefreshToken);
public sealed record UserDto(Guid Id, string Name, string Email, UserRole Role, string? AvatarUrl);

public sealed record ClassroomDto(Guid Id, string Name, string Description, string InviteCode, Guid TeacherId, int StudentCount);
public sealed record CreateClassroomRequest(string Name, string Description);
public sealed record JoinClassRequest(string InviteCode);
public sealed record StudentProgressDto(Guid StudentId, string Name, string Email, int Xp, int Level, int CompletedExercises, int FailedAttempts, DateTime? LastActivity);

public sealed record TrackDto(Guid Id, string Title, string Description, ProgrammingLanguage Language, string Theme, int ModuleCount);
public sealed record CreateTrackRequest(string Title, string Description, ProgrammingLanguage Language, string Theme);
public sealed record ModuleDto(Guid Id, Guid TrackId, string Title, string Description, int OrderIndex, int RequiredXp, int LessonCount, int ExerciseCount, int Progress);
public sealed record CreateModuleRequest(Guid TrackId, string Title, string Description, int OrderIndex, int RequiredXp);
public sealed record LessonDto(Guid Id, Guid ModuleId, string Title, string Objective, string ContentJson, int OrderIndex);
public sealed record CreateLessonRequest(Guid ModuleId, string Title, string Objective, string ContentJson, int OrderIndex);

public sealed record ExerciseDto(
    Guid Id,
    Guid ModuleId,
    Guid? LessonId,
    string Title,
    string Description,
    ProgrammingLanguage Language,
    ExerciseDifficulty Difficulty,
    string StarterCode,
    int XpReward,
    string SkillsJson,
    string HintsJson,
    bool IsPublished,
    int OrderIndex,
    IReadOnlyList<ExerciseTestDto> Tests);

public sealed record ExerciseTestDto(Guid Id, string Name, ExerciseTestType Type, string? Input, string? ExpectedOutput, string? TestCode, bool IsHidden, int Points, int OrderIndex);
public sealed record CreateExerciseRequest(
    Guid ModuleId,
    Guid? LessonId,
    string Title,
    string Description,
    ProgrammingLanguage Language,
    ExerciseDifficulty Difficulty,
    string StarterCode,
    string ReferenceSolution,
    int XpReward,
    string SkillsJson,
    string HintsJson,
    bool IsPublished,
    int OrderIndex,
    IReadOnlyList<CreateExerciseTestRequest> Tests);

public sealed record CreateExerciseTestRequest(string Name, ExerciseTestType Type, string? Input, string ExpectedOutput, string TestCode, bool IsHidden, int Points, int OrderIndex);

public sealed record CodeRunRequest(Guid ExerciseId, ProgrammingLanguage Language, string Code, string? Stdin);
public sealed record SubmitCodeRequest(Guid ExerciseId, ProgrammingLanguage Language, string Code);
public sealed record RunnerTestResultDto(Guid? TestId, string Name, bool Passed, string? Expected, string? Actual, string? Error, bool IsHidden, int ExecutionTimeMs);
public sealed record CodeRunResponse(CodeRunStatus Status, string Output, string? Error, string? CompilationError, IReadOnlyList<RunnerTestResultDto> Tests, int ExecutionTimeMs, int PassedCount, int FailedCount, int Score, string Feedback);

public sealed record SubmissionDto(Guid Id, Guid ExerciseId, Guid StudentId, SubmissionStatus Status, int Score, string Feedback, int PassedTests, int TotalTests, int AttemptNumber, DateTime CreatedAt, IReadOnlyList<RunnerTestResultDto> TestResults);

public sealed record XpSummaryDto(int TotalXp, int Level, int CurrentLevelXp, int NextLevelXp);
public sealed record BadgeDto(Guid Id, string Title, string Description, string Icon, bool IsUnlocked, DateTime? EarnedAt);
public sealed record RankingEntryDto(Guid StudentId, string Name, int Xp, int Level, int Rank);
public sealed record ClassReportDto(Guid ClassroomId, string ClassName, int StudentCount, int SubmissionCount, int CompletionCount, IReadOnlyList<string> DifficultExercises, IReadOnlyList<StudentProgressDto> DifficultStudents);

public sealed record AiHintRequest(Guid ExerciseId, string StudentCode);
public sealed record AiResponse(string Response, bool IsMocked);
