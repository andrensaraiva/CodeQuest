using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Api.Services.Editor;

public interface IEditorSettingsService
{
    Task<EditorSettingsDto> GetAsync(Guid userId);
    Task<EditorSettingsDto> UpdateAsync(Guid userId, EditorSettingsDto settings);
}

public sealed class EditorSettingsService(AppDbContext db) : IEditorSettingsService
{
    public async Task<EditorSettingsDto> GetAsync(Guid userId)
    {
        var entity = await db.StudentEditorSettings.FirstOrDefaultAsync(x => x.UserId == userId);
        return entity is null ? Defaults() : ToDto(entity);
    }

    public async Task<EditorSettingsDto> UpdateAsync(Guid userId, EditorSettingsDto settings)
    {
        var entity = await db.StudentEditorSettings.FirstOrDefaultAsync(x => x.UserId == userId);
        if (entity is null)
        {
            entity = new StudentEditorSettings { UserId = userId };
            db.StudentEditorSettings.Add(entity);
        }

        entity.FontFamily = settings.FontFamily;
        entity.FontSize = settings.FontSize;
        entity.Theme = settings.Theme;
        entity.BackgroundStyle = settings.BackgroundStyle;
        entity.MinimapEnabled = settings.MinimapEnabled;
        entity.WordWrapEnabled = settings.WordWrapEnabled;
        entity.LineNumbersEnabled = settings.LineNumbersEnabled;
        entity.AutoSuggestionsEnabled = settings.AutoSuggestionsEnabled;
        entity.TabSize = settings.TabSize;
        entity.ReduceAnimations = settings.ReduceAnimations;
        entity.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return ToDto(entity);
    }

    private static EditorSettingsDto Defaults() => new(
        "JetBrains Mono", 14, "codequest-dark", "solid-dark",
        MinimapEnabled: false,
        WordWrapEnabled: false,
        LineNumbersEnabled: true,
        AutoSuggestionsEnabled: true,
        TabSize: 4,
        ReduceAnimations: false);

    private static EditorSettingsDto ToDto(StudentEditorSettings entity) => new(
        entity.FontFamily,
        entity.FontSize,
        entity.Theme,
        entity.BackgroundStyle,
        entity.MinimapEnabled,
        entity.WordWrapEnabled,
        entity.LineNumbersEnabled,
        entity.AutoSuggestionsEnabled,
        entity.TabSize,
        entity.ReduceAnimations);
}
