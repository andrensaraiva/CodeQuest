using System.Text.Json;
using CodeQuest.Api.Entities;
using CodeQuest.Api.Enums;
using Microsoft.EntityFrameworkCore;
using LearningModule = CodeQuest.Api.Entities.Module;

namespace CodeQuest.Api.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync())
        {
            return;
        }

        var teacher = new User
        {
            Name = "Professor Demo",
            Email = "teacher@codequest.dev",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = UserRole.Teacher,
            AvatarUrl = "https://api.dicebear.com/8.x/shapes/svg?seed=teacher"
        };

        var students = Enumerable.Range(1, 5).Select(i => new User
        {
            Name = $"Student {i}",
            Email = $"student{i}@codequest.dev",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = UserRole.Student,
            AvatarUrl = $"https://api.dicebear.com/8.x/shapes/svg?seed=student{i}"
        }).ToList();

        var classroom = new Classroom
        {
            Name = "2o Ano Jogos Digitais",
            Description = "C# fundamentals for game logic and future Unity projects.",
            TeacherId = teacher.Id,
            InviteCode = "JOGOS2026"
        };

        var track = new Track
        {
            Title = "C# for Game Logic",
            Description = "Learn programming fundamentals by building small RPG and game-system logic in C#.",
            Language = ProgrammingLanguage.CSharp,
            Theme = "Coding RPG",
            CreatedByTeacherId = teacher.Id
        };

        var modules = new[]
        {
            new LearningModule { TrackId = track.Id, Title = "Village of Variables", Description = "Values, types, and simple formulas for game stats.", OrderIndex = 1, RequiredXp = 0 },
            new LearningModule { TrackId = track.Id, Title = "Forest of Conditionals", Description = "Use decisions to control game rules and player state.", OrderIndex = 2, RequiredXp = 30 },
            new LearningModule { TrackId = track.Id, Title = "Function Lab", Description = "Package logic into methods that can power game systems.", OrderIndex = 3, RequiredXp = 80 }
        };

        var lessons = new[]
        {
            new Lesson
            {
                ModuleId = modules[0].Id,
                Title = "What are variables?",
                Objective = "Store and reuse values such as health, attack, and XP.",
                OrderIndex = 1,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { type = "paragraph", text = "Variables are named containers for values. In games, they often represent health, damage, score, or inventory counts." },
                    new { type = "code", language = "csharp", code = "int health = 100;\nint defeatedEnemies = 4;\nint xp = defeatedEnemies * 25;" },
                    new { type = "mistake", text = "A common mistake is changing a number in one place but forgetting to reuse the variable everywhere else." },
                    new { type = "summary", text = "Good variable names make game logic easier to test and debug." }
                })
            },
            new Lesson
            {
                ModuleId = modules[1].Id,
                Title = "Understanding if/else",
                Objective = "Use conditions to decide if a player is alive, blocked, or victorious.",
                OrderIndex = 1,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { type = "paragraph", text = "Conditionals let your code react to game state. A dungeon gate can check level, or a battle can check health." },
                    new { type = "code", language = "csharp", code = "if (health > 0)\n{\n    return true;\n}\nreturn false;" },
                    new { type = "mistake", text = "Watch equality boundaries: level 3 should pass a required level of 3 when the rule says at least." },
                    new { type = "summary", text = "Conditionals turn raw values into decisions." }
                })
            },
            new Lesson
            {
                ModuleId = modules[2].Id,
                Title = "Creating methods in C#",
                Objective = "Write reusable methods with parameters and return values.",
                OrderIndex = 1,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { type = "paragraph", text = "Methods are named actions. They receive inputs, run logic, and can return a result." },
                    new { type = "code", language = "csharp", code = "public static int CalculateDamage(int attack, int defense)\n{\n    return attack - defense;\n}" },
                    new { type = "mistake", text = "Do not change the method name or parameters when the tests expect a specific signature." },
                    new { type = "summary", text = "Small methods are perfect for testing game rules." }
                })
            }
        };

        var exercises = BuildExercises(modules, lessons, teacher.Id);
        var badges = new[]
        {
            new Badge { Title = "First Code", Description = "Clear your first coding quest.", Icon = "sparkles", ConditionType = "first_success", ConditionValue = 1 },
            new Badge { Title = "C# Apprentice", Description = "Complete three C# exercises.", Icon = "braces", ConditionType = "csharp_completed", ConditionValue = 3 },
            new Badge { Title = "Boss Defeated", Description = "Complete a boss challenge.", Icon = "swords", ConditionType = "boss_completed", ConditionValue = 1 }
        };

        db.Users.Add(teacher);
        db.Users.AddRange(students);
        db.Classrooms.Add(classroom);
        db.ClassStudents.AddRange(students.Select(s => new ClassStudent { ClassroomId = classroom.Id, StudentId = s.Id }));
        db.Tracks.Add(track);
        db.Modules.AddRange(modules);
        db.Lessons.AddRange(lessons);
        db.Exercises.AddRange(exercises);
        db.Badges.AddRange(badges);

        var firstSubmission = new Submission
        {
            ExerciseId = exercises[0].Id,
            StudentId = students[0].Id,
            Code = exercises[0].ReferenceSolution,
            Status = SubmissionStatus.Passed,
            Score = 100,
            Feedback = "Quest cleared. All tests passed.",
            PassedTests = 4,
            TotalTests = 4,
            AttemptNumber = 1
        };
        var failedSubmission = new Submission
        {
            ExerciseId = exercises[1].Id,
            StudentId = students[1].Id,
            Code = exercises[1].StarterCode,
            Status = SubmissionStatus.Failed,
            Score = 50,
            Feedback = "Your damage formula needs to clamp negative damage to zero.",
            PassedTests = 2,
            TotalTests = 4,
            AttemptNumber = 1
        };

        db.Submissions.AddRange(firstSubmission, failedSubmission);
        db.XpEvents.Add(new XpEvent { StudentId = students[0].Id, Amount = 30, Reason = "Exercise completed", SourceType = "Exercise", SourceId = exercises[0].Id });
        db.StudentBadges.Add(new StudentBadge { StudentId = students[0].Id, BadgeId = badges[0].Id });
        await db.SaveChangesAsync();
    }

    private static List<Exercise> BuildExercises(IReadOnlyList<LearningModule> modules, IReadOnlyList<Lesson> lessons, Guid teacherId)
    {
        return
        [
            CreateExercise(
                modules[1].Id,
                lessons[1].Id,
                teacherId,
                "Player Health Check",
                "Create a method that receives the player health and returns true if the player is alive.",
                ExerciseDifficulty.Easy,
                30,
                "conditionals",
                "public class Program\n{\n    public static bool IsAlive(int health)\n    {\n        return false;\n    }\n}",
                "public class Program\n{\n    public static bool IsAlive(int health)\n    {\n        return health > 0;\n    }\n}",
                ["Think about whether zero health should count as alive.", "A comparison operator is enough for this quest."],
                [("IsAlive(10)", "true", false), ("IsAlive(1)", "true", false), ("IsAlive(0)", "false", true), ("IsAlive(-5)", "false", true)]),
            CreateExercise(
                modules[2].Id,
                lessons[2].Id,
                teacherId,
                "Calculate Damage",
                "Create a method that returns attack - defense. If the result is negative, return 0.",
                ExerciseDifficulty.Easy,
                30,
                "conditionals,math,methods",
                "public class Program\n{\n    public static int CalculateDamage(int attack, int defense)\n    {\n        return 0;\n    }\n}",
                "public class Program\n{\n    public static int CalculateDamage(int attack, int defense)\n    {\n        var damage = attack - defense;\n        return damage < 0 ? 0 : damage;\n    }\n}",
                ["Calculate the raw damage first.", "If the raw result is below zero, return zero instead."],
                [("CalculateDamage(10, 3)", "7", false), ("CalculateDamage(3, 10)", "0", false), ("CalculateDamage(5, 5)", "0", true), ("CalculateDamage(20, 0)", "20", true)]),
            CreateExercise(
                modules[1].Id,
                lessons[1].Id,
                teacherId,
                "Can Enter Dungeon",
                "Return true if the player level is at least the required level.",
                ExerciseDifficulty.Easy,
                30,
                "conditionals,comparisons",
                "public class Program\n{\n    public static bool CanEnterDungeon(int playerLevel, int requiredLevel)\n    {\n        return false;\n    }\n}",
                "public class Program\n{\n    public static bool CanEnterDungeon(int playerLevel, int requiredLevel)\n    {\n        return playerLevel >= requiredLevel;\n    }\n}",
                ["At least means equal levels are allowed.", "Use a greater-than-or-equal comparison."],
                [("CanEnterDungeon(5, 3)", "true", false), ("CanEnterDungeon(3, 3)", "true", false), ("CanEnterDungeon(2, 3)", "false", true)]),
            CreateExercise(
                modules[0].Id,
                lessons[0].Id,
                teacherId,
                "Calculate XP Reward",
                "Each defeated enemy gives 25 XP. Return the total XP.",
                ExerciseDifficulty.Beginner,
                20,
                "variables,math",
                "public class Program\n{\n    public static int CalculateXP(int defeatedEnemies)\n    {\n        return 0;\n    }\n}",
                "public class Program\n{\n    public static int CalculateXP(int defeatedEnemies)\n    {\n        return defeatedEnemies * 25;\n    }\n}",
                ["One enemy is 25 XP.", "Multiply the enemy count by 25."],
                [("CalculateXP(0)", "0", false), ("CalculateXP(1)", "25", false), ("CalculateXP(4)", "100", true)]),
            CreateExercise(
                modules[2].Id,
                lessons[2].Id,
                teacherId,
                "Boss - Simple Turn Result",
                "Create a method that receives playerHealth and enemyHealth after a turn. Return Victory, Defeat, or Continue.",
                ExerciseDifficulty.Boss,
                150,
                "functions,conditionals,boss",
                "public class Program\n{\n    public static string GetTurnResult(int playerHealth, int enemyHealth)\n    {\n        return \"\";\n    }\n}",
                "public class Program\n{\n    public static string GetTurnResult(int playerHealth, int enemyHealth)\n    {\n        if (enemyHealth <= 0) return \"Victory\";\n        if (playerHealth <= 0) return \"Defeat\";\n        return \"Continue\";\n    }\n}",
                ["Check enemy health first for Victory.", "Only return Continue when nobody has been defeated."],
                [("GetTurnResult(10, 0)", "Victory", false), ("GetTurnResult(10, -5)", "Victory", true), ("GetTurnResult(0, 10)", "Defeat", false), ("GetTurnResult(-1, 10)", "Defeat", true), ("GetTurnResult(10, 10)", "Continue", false)])
        ];
    }

    private static Exercise CreateExercise(Guid moduleId, Guid lessonId, Guid teacherId, string title, string description, ExerciseDifficulty difficulty, int xp, string skills, string starter, string solution, string[] hints, IReadOnlyList<(string Name, string Expected, bool Hidden)> tests)
    {
        var exercise = new Exercise
        {
            ModuleId = moduleId,
            LessonId = lessonId,
            Title = title,
            Description = description,
            Language = ProgrammingLanguage.CSharp,
            Difficulty = difficulty,
            StarterCode = starter,
            ReferenceSolution = solution,
            XpReward = xp,
            SkillsJson = JsonSerializer.Serialize(skills.Split(',')),
            HintsJson = JsonSerializer.Serialize(hints),
            IsPublished = true,
            OrderIndex = xp == 150 ? 99 : xp,
            CreatedByTeacherId = teacherId
        };

        exercise.Tests = tests.Select((t, index) => new ExerciseTest
        {
            ExerciseId = exercise.Id,
            Name = t.Name,
            Type = ExerciseTestType.UnitTest,
            ExpectedOutput = t.Expected,
            TestCode = t.Name,
            IsHidden = t.Hidden,
            Points = 1,
            OrderIndex = index + 1
        }).ToList();

        return exercise;
    }
}
