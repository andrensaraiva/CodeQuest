using System.Security.Claims;
using CodeQuest.Api.Enums;

namespace CodeQuest.Api.Security;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(value, out var id) || id == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Missing or invalid user identifier in token.");
        }
        return id;
    }

    public static UserRole GetRole(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.Role);
        return Enum.TryParse<UserRole>(value, out var role) ? role : UserRole.Student;
    }
}
