using CodeQuest.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Classroom> Classrooms => Set<Classroom>();
    public DbSet<ClassStudent> ClassStudents => Set<ClassStudent>();
    public DbSet<Track> Tracks => Set<Track>();
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<ExerciseTest> ExerciseTests => Set<ExerciseTest>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<SubmissionTestResult> SubmissionTestResults => Set<SubmissionTestResult>();
    public DbSet<XpEvent> XpEvents => Set<XpEvent>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<StudentBadge> StudentBadges => Set<StudentBadge>();
    public DbSet<CodeRun> CodeRuns => Set<CodeRun>();
    public DbSet<AiInteraction> AiInteractions => Set<AiInteraction>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<User>().HasIndex(x => x.Email).IsUnique();
        builder.Entity<Classroom>().HasIndex(x => x.InviteCode).IsUnique();
        builder.Entity<ClassStudent>().HasIndex(x => new { x.ClassroomId, x.StudentId }).IsUnique();
        builder.Entity<StudentBadge>().HasIndex(x => new { x.StudentId, x.BadgeId }).IsUnique();
        builder.Entity<XpEvent>().HasIndex(x => new { x.StudentId, x.SourceType, x.SourceId, x.Reason });
        builder.Entity<RefreshToken>().HasIndex(x => x.TokenHash).IsUnique();
        builder.Entity<RefreshToken>().HasIndex(x => x.UserId);
        builder.Entity<Submission>().HasIndex(x => new { x.StudentId, x.ExerciseId });
        builder.Entity<Submission>().HasIndex(x => x.CreatedAt);

        builder.Entity<Classroom>()
            .HasOne(x => x.Teacher)
            .WithMany()
            .HasForeignKey(x => x.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Track>()
            .HasOne(x => x.CreatedByTeacher)
            .WithMany()
            .HasForeignKey(x => x.CreatedByTeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Exercise>()
            .HasOne(x => x.CreatedByTeacher)
            .WithMany()
            .HasForeignKey(x => x.CreatedByTeacherId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
