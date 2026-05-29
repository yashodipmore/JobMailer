using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using JobMailApi.Contracts;
using JobMailApi.Data;
using JobMailApi.Extensions;
using JobMailApi.Models;
using JobMailApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobMailApi.Controllers;

[ApiController]
[Authorize]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly GroqService _groqService;
    private readonly EncryptionService _encryptionService;
    private readonly MailService _mailService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(
        AppDbContext db,
        GroqService groqService,
        EncryptionService encryptionService,
        MailService mailService,
        ILogger<ChatController> logger)
    {
        _db = db;
        _groqService = groqService;
        _encryptionService = encryptionService;
        _mailService = mailService;
        _logger = logger;
    }

    [HttpPost("message")]
    public async Task<ActionResult<ChatMessageResponse>> Message(ChatMessageRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Message is required." });
        }

        var userId = User.GetUserId();
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        var profile = await _db.CandidateProfiles.AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile == null)
        {
            return BadRequest(new { message = "Profile must be completed before using chat." });
        }

        var recipientEmail = ExtractRecipientEmail(request.Message);
        var systemPrompt = BuildSystemPrompt(profile, user, recipientEmail);
        GroqService.GroqAiResponse aiResponse;
        try
        {
            aiResponse = await _groqService.GenerateAsync(systemPrompt, request.Message, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Groq AI call failed for user {UserId}", userId);
            return StatusCode(StatusCodes.Status502BadGateway,
                new { message = "AI service failed. Try again in a moment." });
        }

        EmailDraft? emailDraft = null;
        if (string.Equals(aiResponse.Type, "email", StringComparison.OrdinalIgnoreCase) && aiResponse.Email != null)
        {
            var toEmail = string.IsNullOrWhiteSpace(aiResponse.Email.ToEmail)
                ? recipientEmail ?? string.Empty
                : aiResponse.Email.ToEmail;

            emailDraft = new EmailDraft(
                aiResponse.Email.Subject,
                aiResponse.Email.Body,
                toEmail);
        }

        var reply = string.IsNullOrWhiteSpace(aiResponse.Reply)
            ? emailDraft == null ? "I need more details to continue." : "Draft ready."
            : aiResponse.Reply;

        return Ok(new ChatMessageResponse(reply, emailDraft));
    }

    [HttpPost("send-email")]
    public async Task<IActionResult> SendEmail(SendEmailRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ToEmail)
            || string.IsNullOrWhiteSpace(request.Subject)
            || string.IsNullOrWhiteSpace(request.Body))
        {
            return BadRequest(new { message = "ToEmail, subject, and body are required." });
        }

        var userId = User.GetUserId();
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        if (string.IsNullOrWhiteSpace(user.GmailAppPasswordEncrypted))
        {
            return BadRequest(new { message = "Gmail app password is missing." });
        }

        var appPassword = _encryptionService.Decrypt(user.GmailAppPasswordEncrypted);

        try
        {
            string? cvPath = null;
            string? cvName = null;
            var body = request.Body.Trim();
            var toEmail = request.ToEmail.Trim();
            var subject = request.Subject.Trim();

            if (request.IncludeCv)
            {
                var profile = await _db.CandidateProfiles.AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

                cvPath = profile?.CvFilePath;
                cvName = profile?.CvFileName;

                if (string.IsNullOrWhiteSpace(cvPath)
                    && !string.IsNullOrWhiteSpace(profile?.CvLink)
                    && !body.Contains(profile.CvLink, StringComparison.OrdinalIgnoreCase))
                {
                    body = $"{body}\n\nCV: {profile.CvLink.Trim()}";
                }
            }

            await _mailService.SendAsync(
                user.GmailAddress,
                appPassword,
                toEmail,
                subject,
                body,
                cvPath,
                cvName,
                cancellationToken);

            _db.EmailHistories.Add(new EmailHistory
            {
                UserId = userId,
                ToEmail = toEmail,
                Subject = subject,
                SentAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Failed to send email." });
        }

        return Ok(new { message = "Email sent." });
    }

        private static string BuildSystemPrompt(CandidateProfile profile, User user, string? recipientEmail)
        {
                var experience = FormatExperience(profile.ExperienceJson);
                var projects = FormatProjects(profile.ProjectsJson);
                var education = FormatEducation(profile.EducationJson);
                var cvRaw = TrimTo(profile.CvRawText, 4000);
                var recipientHint = string.IsNullOrWhiteSpace(recipientEmail) ? "N/A" : recipientEmail;
                var cvLink = Safe(profile.CvLink);

                return $@"You are JobMail AI. Draft short, professional application emails using the candidate profile deeply.

Output rules (strict):
- Return valid JSON only. No prose, no code fences.
- Use exactly one of these schemas:
    1) {{ ""type"": ""question"", ""reply"": ""..."" }}
    2) {{ ""type"": ""email"", ""reply"": ""..."", ""email"": {{ ""subject"": ""..."", ""body"": ""..."", ""toEmail"": ""..."" }} }}
- If the job post contains a recipient email, set `toEmail` to that email and do not ask for it.
- If recipient email or role/company is missing, ask a single concise follow-up question.

Email rules (strict):
- Subject: <= 10 words, specific to role and company.
- Body: proper email formatting with greeting, 2-3 short paragraphs, closing, and signature with candidate name.
- Use line breaks with \n (no bullet lists).
- MUST include at least 2 concrete profile facts (skills, experience, projects, achievements, or education).
- Avoid generic filler; tie the profile facts directly to the JD requirements.
- If a CV link is provided, include a short line like ""CV: <link>"" before the closing.

Recipient email detected from job post: {recipientHint}

Candidate profile:
Name: {Safe(profile.FullName)}
Current role: {Safe(profile.CurrentRole)}
Years of experience: {profile.YearsOfExperience}
Location: {Safe(profile.Location)}
Objective: {Safe(profile.Objective)}
Skills: {Safe(profile.Skills)}
Phone: {Safe(profile.PhoneNumber)}
LinkedIn: {Safe(profile.LinkedInUrl)}
GitHub: {Safe(profile.GitHubUrl)}
Portfolio: {Safe(profile.PortfolioUrl)}
Current company: {Safe(profile.CurrentCompany)}
Notice period: {Safe(profile.NoticePeriod)}
Preferred roles: {Safe(profile.PreferredRoles)}
Preferred locations: {Safe(profile.PreferredLocations)}
Work authorization: {Safe(profile.WorkAuthorization)}
Experience (most recent first):
{experience}
Projects:
{projects}
Education:
{education}
Achievements: {Safe(profile.Achievements)}
Open source: {Safe(profile.OpenSourceContributions)}
CV raw text (verbatim, may be long):
{cvRaw}

Sender Gmail address: {Safe(user.GmailAddress)}
CV link (if provided): {cvLink}";
        }

    private static readonly Regex EmailRegex = new(
        @"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static string? ExtractRecipientEmail(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return null;
        }

        var match = EmailRegex.Match(message);
        return match.Success ? match.Value : null;
    }

    private static string Safe(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? "N/A" : value.Trim();
    }

    private static string TrimTo(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return "N/A";
        }

        var trimmed = value.Trim();
        return trimmed.Length <= maxLength ? trimmed : trimmed[..maxLength] + "...";
    }

    private static string FormatExperience(string? json)
    {
        var items = DeserializeList<ExperienceItem>(json);
        if (items.Count == 0)
        {
            return "N/A";
        }

        var builder = new StringBuilder();
        for (var i = 0; i < items.Count; i++)
        {
            var item = items[i];
            builder.AppendLine($"{i + 1}. {Safe(item.Company)} — {Safe(item.Role)} ({Safe(item.Duration)}). Achievements: {Safe(item.KeyAchievements)}");
        }

        return builder.ToString().TrimEnd();
    }

    private static string FormatProjects(string? json)
    {
        var items = DeserializeList<ProjectItem>(json);
        if (items.Count == 0)
        {
            return "N/A";
        }

        var builder = new StringBuilder();
        for (var i = 0; i < items.Count; i++)
        {
            var item = items[i];
            builder.AppendLine($"{i + 1}. {Safe(item.Name)} — {Safe(item.Description)}. Tech: {Safe(item.TechStack)}. Link: {Safe(item.Link)}");
        }

        return builder.ToString().TrimEnd();
    }

    private static string FormatEducation(string? json)
    {
        var items = DeserializeList<EducationItem>(json);
        if (items.Count == 0)
        {
            return "N/A";
        }

        var builder = new StringBuilder();
        for (var i = 0; i < items.Count; i++)
        {
            var item = items[i];
            builder.AppendLine($"{i + 1}. {Safe(item.Degree)} — {Safe(item.College)} ({Safe(item.Year)})");
        }

        return builder.ToString().TrimEnd();
    }

    private static List<T> DeserializeList<T>(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<T>();
        }

        try
        {
            return JsonSerializer.Deserialize<List<T>>(json) ?? new List<T>();
        }
        catch (JsonException)
        {
            return new List<T>();
        }
    }
}
