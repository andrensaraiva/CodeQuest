using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Entities;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CodeQuest.Api.Services.Auth;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshAsync(string refreshToken);
    Task RevokeAsync(string refreshToken);
    Task<UserDto?> GetUserAsync(Guid userId);
}

public sealed class AuthService(AppDbContext db, IOptions<JwtOptions> jwt) : IAuthService
{
    private const int MinPasswordLength = 8;
    private static readonly TimeSpan RefreshLifetime = TimeSpan.FromDays(30);

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (request.Role == UserRole.Admin)
        {
            throw new InvalidOperationException("Admin self-registration is disabled in the MVP.");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < MinPasswordLength)
        {
            throw new InvalidOperationException($"Password must be at least {MinPasswordLength} characters long.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(x => x.Email == email))
        {
            throw new InvalidOperationException("An account with this email already exists.");
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();
        var refresh = await IssueRefreshTokenAsync(user.Id);
        return new AuthResponse(CreateToken(user), refresh, ToDto(user));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var refresh = await IssueRefreshTokenAsync(user.Id);
        return new AuthResponse(CreateToken(user), refresh, ToDto(user));
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new UnauthorizedAccessException("Missing refresh token.");
        }

        var hash = HashToken(refreshToken);
        var stored = await db.RefreshTokens.Include(x => x.User).FirstOrDefaultAsync(x => x.TokenHash == hash);
        if (stored is null || stored.RevokedAt is not null || stored.ExpiresAt < DateTime.UtcNow || stored.User is null)
        {
            throw new UnauthorizedAccessException("Refresh token is invalid or expired.");
        }

        stored.RevokedAt = DateTime.UtcNow;
        var newRefresh = await IssueRefreshTokenAsync(stored.UserId);
        await db.SaveChangesAsync();
        return new AuthResponse(CreateToken(stored.User), newRefresh, ToDto(stored.User));
    }

    public async Task RevokeAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var hash = HashToken(refreshToken);
        var stored = await db.RefreshTokens.FirstOrDefaultAsync(x => x.TokenHash == hash);
        if (stored is null || stored.RevokedAt is not null)
        {
            return;
        }

        stored.RevokedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    public async Task<UserDto?> GetUserAsync(Guid userId)
    {
        var user = await db.Users.FindAsync(userId);
        return user is null ? null : ToDto(user);
    }

    private async Task<string> IssueRefreshTokenAsync(Guid userId)
    {
        var bytes = RandomNumberGenerator.GetBytes(48);
        var token = Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = userId,
            TokenHash = HashToken(token),
            ExpiresAt = DateTime.UtcNow.Add(RefreshLifetime)
        });
        await db.SaveChangesAsync();
        return token;
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }

    private string CreateToken(User user)
    {
        var options = jwt.Value;
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            options.Issuer,
            options.Issuer,
            claims,
            expires: DateTime.UtcNow.AddHours(options.ExpirationHours),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto ToDto(User user) => new(user.Id, user.Name, user.Email, user.Role, user.AvatarUrl);
}
