using System.IO;
using System.Text.Json;
using JobMailApi.Contracts;
using JobMailApi.Data;
using JobMailApi.Extensions;
using JobMailApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobMailApi.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _environment;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ProfileController(AppDbContext db, IWebHostEnvironment environment)
    {
        _db = db;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<ProfileResponse?>> Get()
    {
        var userId = User.GetUserId();
        var profile = await _db.CandidateProfiles.AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            return Ok(null);
        }

        return Ok(ToResponse(profile));
    }

    [HttpPut]
    public async Task<ActionResult<ProfileResponse>> Upsert(ProfileUpsertRequest request)
    {
        var userId = User.GetUserId();
        var profile = await _db.CandidateProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            profile = new CandidateProfile { UserId = userId };
            _db.CandidateProfiles.Add(profile);
        }

        profile.FullName = Normalize(request.FullName);
        profile.CurrentRole = Normalize(request.CurrentRole);
        profile.YearsOfExperience = request.YearsOfExperience;
        profile.Location = Normalize(request.Location);
        profile.Objective = Normalize(request.Objective);
        profile.Skills = Normalize(request.Skills);
        profile.PhoneNumber = Normalize(request.PhoneNumber);
        profile.LinkedInUrl = Normalize(request.LinkedInUrl);
        profile.GitHubUrl = Normalize(request.GitHubUrl);
        profile.PortfolioUrl = Normalize(request.PortfolioUrl);
        profile.CvLink = Normalize(request.CvLink);
        profile.CurrentCompany = Normalize(request.CurrentCompany);
        profile.NoticePeriod = Normalize(request.NoticePeriod);
        profile.PreferredRoles = Normalize(request.PreferredRoles);
        profile.PreferredLocations = Normalize(request.PreferredLocations);
        profile.WorkAuthorization = Normalize(request.WorkAuthorization);
        profile.ExperienceJson = JsonSerializer.Serialize(request.Experience ?? new List<ExperienceItem>(), JsonOptions);
        profile.ProjectsJson = JsonSerializer.Serialize(request.Projects ?? new List<ProjectItem>(), JsonOptions);
        profile.EducationJson = JsonSerializer.Serialize(request.Education ?? new List<EducationItem>(), JsonOptions);
        profile.Achievements = Normalize(request.Achievements);
        profile.OpenSourceContributions = Normalize(request.OpenSourceContributions);
        profile.CvRawText = Normalize(request.CvRawText);
        profile.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(ToResponse(profile));
    }

    [HttpPost("cv")]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult<CvUploadResponse>> UploadCv([FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "CV file is required." });
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension != ".pdf")
        {
            return BadRequest(new { message = "Only PDF files are supported." });
        }

        var userId = User.GetUserId();
        var profile = await _db.CandidateProfiles.FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (profile == null)
        {
            return BadRequest(new { message = "Complete your profile before uploading a CV." });
        }

        var uploadRoot = Path.Combine(_environment.ContentRootPath, "Uploads", "cv");
        Directory.CreateDirectory(uploadRoot);

        var storedFileName = $"cv-{userId}{extension}";
        var filePath = Path.Combine(uploadRoot, storedFileName);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        profile.CvFileName = file.FileName;
        profile.CvFilePath = filePath;
        profile.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new CvUploadResponse(profile.CvFileName, file.Length));
    }

    [HttpGet("cv")]
    public async Task<IActionResult> GetCv(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var profile = await _db.CandidateProfiles.AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile == null
            || string.IsNullOrWhiteSpace(profile.CvFilePath)
            || !System.IO.File.Exists(profile.CvFilePath))
        {
            return NotFound(new { message = "No CV uploaded." });
        }

        var fileName = string.IsNullOrWhiteSpace(profile.CvFileName) ? "cv.pdf" : profile.CvFileName;
        return PhysicalFile(profile.CvFilePath, "application/pdf", fileName);
    }

    private static ProfileResponse ToResponse(CandidateProfile profile)
    {
        return new ProfileResponse(
            profile.FullName,
            profile.CurrentRole,
            profile.YearsOfExperience,
            profile.Location,
            profile.Objective,
            profile.Skills,
            profile.PhoneNumber,
            profile.LinkedInUrl,
            profile.GitHubUrl,
            profile.PortfolioUrl,
            profile.CvLink,
            profile.CvFileName,
            profile.CurrentCompany,
            profile.NoticePeriod,
            profile.PreferredRoles,
            profile.PreferredLocations,
            profile.WorkAuthorization,
            DeserializeList<ExperienceItem>(profile.ExperienceJson),
            DeserializeList<ProjectItem>(profile.ProjectsJson),
            DeserializeList<EducationItem>(profile.EducationJson),
            profile.Achievements,
            profile.OpenSourceContributions,
            profile.CvRawText,
            profile.UpdatedAt);
    }

    private static List<T> DeserializeList<T>(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<T>();
        }

        return JsonSerializer.Deserialize<List<T>>(json, JsonOptions) ?? new List<T>();
    }

    private static string Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim();
    }
}
