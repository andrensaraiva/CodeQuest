namespace CodeQuest.Api.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "CodeQuestAcademy";
    public string Key { get; set; } = string.Empty;
    public int ExpirationHours { get; set; } = 12;

    public void Validate(bool isDevelopment)
    {
        if (string.IsNullOrWhiteSpace(Key))
        {
            throw new InvalidOperationException(
                "Jwt:Key is not configured. Set it via appsettings, user secrets, or the Jwt__Key environment variable.");
        }

        if (Key.Length < 32)
        {
            var message = "Jwt:Key must be at least 32 characters (256 bits) for HS256.";
            if (isDevelopment)
            {
                Console.Error.WriteLine($"[WARN] {message} Using a weak key in development.");
            }
            else
            {
                throw new InvalidOperationException(message);
            }
        }
    }
}
