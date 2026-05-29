namespace JobMailApi.Settings;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "JobMailApi";
    public string Audience { get; set; } = "JobMailApi";
    public string Key { get; set; } = string.Empty;
    public int ExpiresMinutes { get; set; } = 120;
}
