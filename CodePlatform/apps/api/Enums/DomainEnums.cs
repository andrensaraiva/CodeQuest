namespace CodeQuest.Api.Enums;

public enum UserRole
{
    Admin = 1,
    Teacher = 2,
    Student = 3
}

public enum ProgrammingLanguage
{
    CSharp = 1,
    Java = 2,
    JavaScript = 3,
    Python = 4
}

public enum ExerciseDifficulty
{
    Beginner = 1,
    Easy = 2,
    Medium = 3,
    Hard = 4,
    Boss = 5
}

public enum ExerciseTestType
{
    InputOutput = 1,
    UnitTest = 2,
    StaticAnalysis = 3
}

public enum SubmissionStatus
{
    Running = 1,
    Passed = 2,
    Failed = 3,
    Error = 4
}

public enum CodeRunStatus
{
    Completed = 1,
    Failed = 2,
    CompilationError = 3,
    Timeout = 4
}
