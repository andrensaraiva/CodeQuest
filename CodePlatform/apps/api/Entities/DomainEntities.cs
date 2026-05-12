using CodeQuest.Api.Enums;

namespace CodeQuest.Api.Entities;

public sealed class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Classroom
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid TeacherId { get; set; }
    public User? Teacher { get; set; }
    public string InviteCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<ClassStudent> Students { get; set; } = [];
}

public sealed class ClassStudent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClassroomId { get; set; }
    public Classroom? Classroom { get; set; }
    public Guid StudentId { get; set; }
    public User? Student { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Track
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ProgrammingLanguage Language { get; set; } = ProgrammingLanguage.CSharp;
    public string Theme { get; set; } = "Game Logic";
    public Guid CreatedByTeacherId { get; set; }
    public User? CreatedByTeacher { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<Module> Modules { get; set; } = [];
}

public sealed class Module
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TrackId { get; set; }
    public Track? Track { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public int RequiredXp { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<Lesson> Lessons { get; set; } = [];
    public List<Exercise> Exercises { get; set; } = [];
}

public sealed class Lesson
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ModuleId { get; set; }
    public Module? Module { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Objective { get; set; } = string.Empty;
    public string ContentJson { get; set; } = "[]";
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Exercise
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ModuleId { get; set; }
    public Module? Module { get; set; }
    public Guid? LessonId { get; set; }
    public Lesson? Lesson { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ProgrammingLanguage Language { get; set; } = ProgrammingLanguage.CSharp;
    public ExerciseDifficulty Difficulty { get; set; } = ExerciseDifficulty.Easy;
    public string StarterCode { get; set; } = string.Empty;
    public string ReferenceSolution { get; set; } = string.Empty;
    public int XpReward { get; set; }
    public string SkillsJson { get; set; } = "[]";
    public string HintsJson { get; set; } = "[]";
    public bool IsPublished { get; set; }
    public int OrderIndex { get; set; }
    public bool AllowHints { get; set; } = true;
    public bool AllowSolutionReveal { get; set; }
    public int SolutionRevealXpPercent { get; set; }
    public Guid CreatedByTeacherId { get; set; }
    public User? CreatedByTeacher { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<ExerciseTest> Tests { get; set; } = [];
    public List<ExerciseHint> ExerciseHints { get; set; } = [];
}

public sealed class ExerciseHint
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ExerciseId { get; set; }
    public Exercise? Exercise { get; set; }
    public int OrderIndex { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int PenaltyPercent { get; set; } = 10;
    public bool IsSolutionReveal { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class StudentHintUnlock
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public User? Student { get; set; }
    public Guid ExerciseId { get; set; }
    public Exercise? Exercise { get; set; }
    public Guid HintId { get; set; }
    public ExerciseHint? Hint { get; set; }
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;
}

public sealed class StudentEditorSettings
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string FontFamily { get; set; } = "JetBrains Mono";
    public int FontSize { get; set; } = 14;
    public string Theme { get; set; } = "codequest-dark";
    public string BackgroundStyle { get; set; } = "solid-dark";
    public bool MinimapEnabled { get; set; }
    public bool WordWrapEnabled { get; set; }
    public bool LineNumbersEnabled { get; set; } = true;
    public bool AutoSuggestionsEnabled { get; set; } = true;
    public int TabSize { get; set; } = 4;
    public bool ReduceAnimations { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class ExerciseTest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ExerciseId { get; set; }
    public Exercise? Exercise { get; set; }
    public string Name { get; set; } = string.Empty;
    public ExerciseTestType Type { get; set; } = ExerciseTestType.UnitTest;
    public string? Input { get; set; }
    public string ExpectedOutput { get; set; } = string.Empty;
    public string TestCode { get; set; } = string.Empty;
    public bool IsHidden { get; set; }
    public int Points { get; set; } = 1;
    public int OrderIndex { get; set; }
}

public sealed class Submission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ExerciseId { get; set; }
    public Exercise? Exercise { get; set; }
    public Guid StudentId { get; set; }
    public User? Student { get; set; }
    public string Code { get; set; } = string.Empty;
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Running;
    public int Score { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public int PassedTests { get; set; }
    public int TotalTests { get; set; }
    public int AttemptNumber { get; set; }
    public int HintsUsedCount { get; set; }
    public int HighestHintLevelUsed { get; set; }
    public int HintPenaltyPercent { get; set; }
    public int XpBeforePenalty { get; set; }
    public int XpAwarded { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<SubmissionTestResult> TestResults { get; set; } = [];
}

public sealed class SubmissionTestResult
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SubmissionId { get; set; }
    public Submission? Submission { get; set; }
    public Guid? TestId { get; set; }
    public ExerciseTest? Test { get; set; }
    public string TestName { get; set; } = string.Empty;
    public bool Passed { get; set; }
    public string? Expected { get; set; }
    public string? Output { get; set; }
    public string? Error { get; set; }
    public bool IsHidden { get; set; }
    public int ExecutionTimeMs { get; set; }
}

public sealed class XpEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public User? Student { get; set; }
    public int Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string SourceType { get; set; } = string.Empty;
    public Guid SourceId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Badge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string ConditionType { get; set; } = string.Empty;
    public int ConditionValue { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class StudentBadge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public User? Student { get; set; }
    public Guid BadgeId { get; set; }
    public Badge? Badge { get; set; }
    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
}

public sealed class CodeRun
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public Guid ExerciseId { get; set; }
    public ProgrammingLanguage Language { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Output { get; set; } = string.Empty;
    public string? Error { get; set; }
    public CodeRunStatus Status { get; set; }
    public int ExecutionTimeMs { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class AiInteraction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid? ExerciseId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Prompt { get; set; } = string.Empty;
    public string Response { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
