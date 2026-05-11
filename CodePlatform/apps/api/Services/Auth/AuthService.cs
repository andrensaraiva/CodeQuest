using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Entities;
using CodeQuest.Api.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CodeQuest.Api.Services.Auth;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<UserDto?> GetUserAsync(Guid userId);
}

public sealed class AuthService(AppDbContext db, IConfiguration config) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (request.Role == UserRole.Admin)
        {
            throw new InvalidOperationException("Admin self-registration is disabled in the MVP.");
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
        return new AuthResponse(CreateToken(user), ToDto(user));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        return new AuthResponse(CreateToken(user), ToDto(user));
    }

    public async Task<UserDto?> GetUserAsync(Guid userId)
    {
        var user = await db.Users.FindAsync(userId);
        return user is null ? null : ToDto(user);
    }

    private string CreateToken(User user)
    {
        var key = config["Jwt:Key"] ?? "dev-only-change-this-codequest-secret-key";
        var issuer = config["Jwt:Issuer"] ?? "CodeQuestAcademy";
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer,
            issuer,
            claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto ToDto(User user) => new(user.Id, user.Name, user.Email, user.Role, user.AvatarUrl);
}
