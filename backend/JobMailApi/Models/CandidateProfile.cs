namespace JobMailApi.Models;

public class CandidateProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public string FullName { get; set; } = string.Empty;
    public string CurrentRole { get; set; } = string.Empty;
    public int YearsOfExperience { get; set; }
    public string Location { get; set; } = string.Empty;

    public string Objective { get; set; } = string.Empty;
    public string Skills { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string LinkedInUrl { get; set; } = string.Empty;
    public string GitHubUrl { get; set; } = string.Empty;
    public string PortfolioUrl { get; set; } = string.Empty;
    public string CvLink { get; set; } = string.Empty;
    public string CvFileName { get; set; } = string.Empty;
    public string CvFilePath { get; set; } = string.Empty;
    public string CurrentCompany { get; set; } = string.Empty;
    public string NoticePeriod { get; set; } = string.Empty;
    public string PreferredRoles { get; set; } = string.Empty;
    public string PreferredLocations { get; set; } = string.Empty;
    public string WorkAuthorization { get; set; } = string.Empty;
    public string ExperienceJson { get; set; } = "[]";
    public string ProjectsJson { get; set; } = "[]";
    public string EducationJson { get; set; } = "[]";
    public string Achievements { get; set; } = string.Empty;
    public string OpenSourceContributions { get; set; } = string.Empty;
    public string CvRawText { get; set; } = string.Empty;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
