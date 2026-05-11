using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.Auth;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CodeQuest.Api.Tests;

public class AuthServiceTests
{
    private static (AppDbContext Db, AuthService Service) CreateService()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new AppDbContext(options);
        var jwt = Options.Create(new JwtOptions
        {
            Issuer = "Test",
            Key = "test-key-must-be-at-least-32-chars-long-1234",
            ExpirationHours = 1
        });
        return (db, new AuthService(db, jwt));
    }

    [Fact]
    public async Task Register_RejectsShortPassword()
    {
        var (_, service) = CreateService();
        var act = () => service.RegisterAsync(new RegisterRequest("Ana", "ana@x.dev", "short", UserRole.Student));
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*at least 8*");
    }

    [Fact]
    public async Task Register_RejectsAdminRole()
    {
        var (_, service) = CreateService();
        var act = () => service.RegisterAsync(new RegisterRequest("X", "x@x.dev", "longenoughpass", UserRole.Admin));
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*Admin*");
    }

    [Fact]
    public async Task Login_FailsWithWrongPassword()
    {
        var (_, service) = CreateService();
        await service.RegisterAsync(new RegisterRequest("Ana", "ana@x.dev", "longenoughpass", UserRole.Student));
        var act = () => service.LoginAsync(new LoginRequest("ana@x.dev", "wrongpassword"));
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Refresh_IssuesNewTokenAndRevokesOld()
    {
        var (db, service) = CreateService();
        var session = await service.RegisterAsync(new RegisterRequest("Ana", "ana@x.dev", "longenoughpass", UserRole.Student));
        var first = session.RefreshToken;

        var refreshed = await service.RefreshAsync(first);
        refreshed.RefreshToken.Should().NotBe(first);

        var act = () => service.RefreshAsync(first);
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
        (await db.RefreshTokens.CountAsync(x => x.RevokedAt != null)).Should().BeGreaterThan(0);
    }
}
