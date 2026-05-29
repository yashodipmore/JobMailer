namespace JobMailApi.Settings;

public sealed class GroqOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "llama-3.1-70b-versatile";
}
