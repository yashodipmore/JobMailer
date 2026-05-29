using System.Text;
using JobMailApi.Contracts;
using JobMailApi.Data;
using JobMailApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobMailApi.Controllers;

[ApiController]
[Authorize]
[Route("api/history")]
public class HistoryController : ControllerBase
{
    private readonly AppDbContext _db;

    public HistoryController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<EmailHistoryResponse>>> Get(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var items = await _db.EmailHistories.AsNoTracking()
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.SentAt)
            .ToListAsync(cancellationToken);

        var response = items
            .Select(item => new EmailHistoryResponse(item.Id, item.ToEmail, item.Subject, item.SentAt))
            .ToList();

        return Ok(response);
    }

    [HttpGet("csv")]
    public async Task<IActionResult> GetCsv(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var items = await _db.EmailHistories.AsNoTracking()
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.SentAt)
            .ToListAsync(cancellationToken);

        var builder = new StringBuilder();
        builder.AppendLine("SentAt,ToEmail,Subject");
        foreach (var item in items)
        {
            builder.Append(CsvEscape(item.SentAt.ToString("yyyy-MM-dd HH:mm:ss")));
            builder.Append(',');
            builder.Append(CsvEscape(item.ToEmail));
            builder.Append(',');
            builder.AppendLine(CsvEscape(item.Subject));
        }

        return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "email-history.csv");
    }

    private static string CsvEscape(string? value)
    {
        var safe = value ?? string.Empty;
        safe = safe.Replace("\"", "\"\"");
        return $"\"{safe}\"";
    }
}
