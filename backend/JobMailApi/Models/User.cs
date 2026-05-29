namespace JobMailApi.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string GmailAddress { get; set; } = string.Empty;
    public string GmailAppPasswordEncrypted { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public CandidateProfile? CandidateProfile { get; set; }
    public List<EmailHistory> EmailHistories { get; set; } = new();
}
