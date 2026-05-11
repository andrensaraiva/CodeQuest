using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Entities;
using CodeQuest.Api.Enums;
using Microsoft.EntityFrameworkCore;
using LearningModule = CodeQuest.Api.Entities.Module;

namespace CodeQuest.Api.Services.Learning;

public interface ILearningService
{
    Task<IReadOnlyList<TrackDto>> GetTracksAsync();
    Task<TrackDto> CreateTrackAsync(Guid teacherId, CreateTrackRequest request);
    Task<Track?> GetTrackEntityAsync(Guid id);
    Task<ModuleDto?> GetModuleAsync(Guid id, Guid? studentId = null);
    Task<IReadOnlyList<ModuleDto>> GetModulesAsync(Guid trackId, Guid? studentId = null);
    Task<ModuleDto> CreateModuleAsync(CreateModuleRequest request);
    Task<IReadOnlyList<LessonDto>> GetLessonsAsync(Guid moduleId);
    Task<LessonDto?> GetLessonAsync(Guid id);
    Task<LessonDto> CreateLessonAsync(CreateLessonRequest request);
    Task<IReadOnlyList<ExerciseDto>> GetExercisesAsync(Guid moduleId, bool includeHiddenTests);
    Task<ExerciseDto?> GetExerciseAsync(Guid id, bool includeHiddenTests);
    Task<Exercise?> GetExerciseEntityAsync(Guid id);
    Task<ExerciseDto> CreateExerciseAsync(Guid teacherId, CreateExerciseRequest request);
    Task<ExerciseDto?> PublishExerciseAsync(Guid id, Guid teacherId);
}

public sealed class LearningService(AppDbContext db) : ILearningService
{
    public async Task<IReadOnlyList<TrackDto>> GetTracksAsync()
    {
        return await db.Tracks.Include(x => x.Modules).OrderBy(x => x.Title)
            .Select(x => new TrackDto(x.Id, x.Title, x.Description, x.Language, x.Theme, x.Modules.Count))
            .ToListAsync();
    }

    public async Task<TrackDto> CreateTrackAsync(Guid teacherId, CreateTrackRequest request)
    {
        var track = new Track
        {
            Title = request.Title,
            Description = request.Description,
            Language = request.Language,
            Theme = request.Theme,
            CreatedByTeacherId = teacherId
        };
        db.Tracks.Add(track);
        await db.SaveChangesAsync();
        return new TrackDto(track.Id, track.Title, track.Description, track.Language, track.Theme, 0);
    }

    public Task<Track?> GetTrackEntityAsync(Guid id) => db.Tracks.Include(x => x.Modules).FirstOrDefaultAsync(x => x.Id == id);

    public async Task<ModuleDto?> GetModuleAsync(Guid id, Guid? studentId = null)
    {
        var module = await db.Modules.Include(x => x.Lessons).Include(x => x.Exercises).FirstOrDefaultAsync(x => x.Id == id);
        if (module is null)
        {
            return null;
        }

        var completed = studentId.HasValue
            ? await db.Submissions.Where(x => x.StudentId == studentId && x.Status == SubmissionStatus.Passed).Select(x => x.ExerciseId).Distinct().ToListAsync()
            : [];
        var total = Math.Max(1, module.Exercises.Count);
        var progress = (int)Math.Round((double)module.Exercises.Count(x => completed.Contains(x.Id)) / total * 100);
        return ToModuleDto(module, progress);
    }

    public async Task<IReadOnlyList<ModuleDto>> GetModulesAsync(Guid trackId, Guid? studentId = null)
    {
        var modules = await db.Modules
            .Include(x => x.Lessons)
            .Include(x => x.Exercises)
            .Where(x => x.TrackId == trackId)
            .OrderBy(x => x.OrderIndex)
            .ToListAsync();

        var completed = studentId.HasValue
            ? await db.Submissions.Where(x => x.StudentId == studentId && x.Status == SubmissionStatus.Passed).Select(x => x.ExerciseId).Distinct().ToListAsync()
            : [];

        return modules.Select(m =>
        {
            var total = Math.Max(1, m.Exercises.Count);
            var progress = (int)Math.Round((double)m.Exercises.Count(x => completed.Contains(x.Id)) / total * 100);
            return ToModuleDto(m, progress);
        }).ToList();
    }

    public async Task<ModuleDto> CreateModuleAsync(CreateModuleRequest request)
    {
        var module = new LearningModule
        {
            TrackId = request.TrackId,
            Title = request.Title,
            Description = request.Description,
            OrderIndex = request.OrderIndex,
            RequiredXp = request.RequiredXp
        };
        db.Modules.Add(module);
        await db.SaveChangesAsync();
        return ToModuleDto(module, 0);
    }

    public async Task<IReadOnlyList<LessonDto>> GetLessonsAsync(Guid moduleId)
    {
        return await db.Lessons.Where(x => x.ModuleId == moduleId).OrderBy(x => x.OrderIndex).Select(x => ToLessonDto(x)).ToListAsync();
    }

    public async Task<LessonDto?> GetLessonAsync(Guid id)
    {
        var lesson = await db.Lessons.FindAsync(id);
        return lesson is null ? null : ToLessonDto(lesson);
    }

    public async Task<LessonDto> CreateLessonAsync(CreateLessonRequest request)
    {
        var lesson = new Lesson
        {
            ModuleId = request.ModuleId,
            Title = request.Title,
            Objective = request.Objective,
            ContentJson = request.ContentJson,
            OrderIndex = request.OrderIndex
        };
        db.Lessons.Add(lesson);
        await db.SaveChangesAsync();
        return ToLessonDto(lesson);
    }

    public async Task<IReadOnlyList<ExerciseDto>> GetExercisesAsync(Guid moduleId, bool includeHiddenTests)
    {
        var exercises = await db.Exercises.Include(x => x.Tests).Where(x => x.ModuleId == moduleId).OrderBy(x => x.OrderIndex).ToListAsync();
        return exercises.Select(x => ToExerciseDto(x, includeHiddenTests)).ToList();
    }

    public async Task<ExerciseDto?> GetExerciseAsync(Guid id, bool includeHiddenTests)
    {
        var exercise = await db.Exercises.Include(x => x.Tests).FirstOrDefaultAsync(x => x.Id == id);
        return exercise is null ? null : ToExerciseDto(exercise, includeHiddenTests);
    }

    public Task<Exercise?> GetExerciseEntityAsync(Guid id) => db.Exercises.Include(x => x.Tests).FirstOrDefaultAsync(x => x.Id == id);

    public async Task<ExerciseDto> CreateExerciseAsync(Guid teacherId, CreateExerciseRequest request)
    {
        var exercise = new Exercise
        {
            ModuleId = request.ModuleId,
            LessonId = request.LessonId,
            Title = request.Title,
            Description = request.Description,
            Language = request.Language,
            Difficulty = request.Difficulty,
            StarterCode = request.StarterCode,
            ReferenceSolution = request.ReferenceSolution,
            XpReward = request.XpReward,
            SkillsJson = request.SkillsJson,
            HintsJson = request.HintsJson,
            IsPublished = request.IsPublished,
            OrderIndex = request.OrderIndex,
            CreatedByTeacherId = teacherId,
            Tests = request.Tests.Select(t => new ExerciseTest
            {
                Name = t.Name,
                Type = t.Type,
                Input = t.Input,
                ExpectedOutput = t.ExpectedOutput,
                TestCode = t.TestCode,
                IsHidden = t.IsHidden,
                Points = t.Points,
                OrderIndex = t.OrderIndex
            }).ToList()
        };

        db.Exercises.Add(exercise);
        await db.SaveChangesAsync();
        return ToExerciseDto(exercise, true);
    }

    public async Task<ExerciseDto?> PublishExerciseAsync(Guid id, Guid teacherId)
    {
        var exercise = await db.Exercises.Include(x => x.Tests).FirstOrDefaultAsync(x => x.Id == id && x.CreatedByTeacherId == teacherId);
        if (exercise is null)
        {
            return null;
        }

        exercise.IsPublished = true;
        exercise.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return ToExerciseDto(exercise, true);
    }

    private static ModuleDto ToModuleDto(LearningModule module, int progress)
    {
        return new ModuleDto(module.Id, module.TrackId, module.Title, module.Description, module.OrderIndex, module.RequiredXp, module.Lessons.Count, module.Exercises.Count, progress);
    }

    private static LessonDto ToLessonDto(Lesson lesson) => new(lesson.Id, lesson.ModuleId, lesson.Title, lesson.Objective, lesson.ContentJson, lesson.OrderIndex);

    private static ExerciseDto ToExerciseDto(Exercise exercise, bool includeHiddenTests)
    {
        var tests = exercise.Tests
            .Where(x => includeHiddenTests || !x.IsHidden)
            .OrderBy(x => x.OrderIndex)
            .Select(x => new ExerciseTestDto(
                x.Id,
                x.Name,
                x.Type,
                x.Input,
                includeHiddenTests || !x.IsHidden ? x.ExpectedOutput : null,
                includeHiddenTests || !x.IsHidden ? x.TestCode : null,
                x.IsHidden,
                x.Points,
                x.OrderIndex))
            .ToList();

        return new ExerciseDto(
            exercise.Id,
            exercise.ModuleId,
            exercise.LessonId,
            exercise.Title,
            exercise.Description,
            exercise.Language,
            exercise.Difficulty,
            exercise.StarterCode,
            exercise.XpReward,
            exercise.SkillsJson,
            exercise.HintsJson,
            exercise.IsPublished,
            exercise.OrderIndex,
            tests);
    }
}
