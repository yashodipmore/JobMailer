namespace JobMailApi.Contracts;

public record ExperienceItem(string Company, string Role, string Duration, string KeyAchievements);
public record ProjectItem(string Name, string Description, string TechStack, string Link);
public record EducationItem(string Degree, string College, string Year);

public record ProfileUpsertRequest(
    string FullName,
    string CurrentRole,
    int YearsOfExperience,
    string Location,
    string Objective,
    string Skills,
    string PhoneNumber,
    string LinkedInUrl,
    string GitHubUrl,
    string PortfolioUrl,
    string CvLink,
    string CurrentCompany,
    string NoticePeriod,
    string PreferredRoles,
    string PreferredLocations,
    string WorkAuthorization,
    List<ExperienceItem> Experience,
    List<ProjectItem> Projects,
    List<EducationItem> Education,
    string Achievements,
    string OpenSourceContributions,
    string CvRawText);

public record ProfileResponse(
    string FullName,
    string CurrentRole,
    int YearsOfExperience,
    string Location,
    string Objective,
    string Skills,
    string PhoneNumber,
    string LinkedInUrl,
    string GitHubUrl,
    string PortfolioUrl,
    string CvLink,
    string CvFileName,
    string CurrentCompany,
    string NoticePeriod,
    string PreferredRoles,
    string PreferredLocations,
    string WorkAuthorization,
    List<ExperienceItem> Experience,
    List<ProjectItem> Projects,
    List<EducationItem> Education,
    string Achievements,
    string OpenSourceContributions,
    string CvRawText,
    DateTime UpdatedAt);

public record CvUploadResponse(string FileName, long Size);
