using System.IO;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace JobMailApi.Services;

public class MailService
{
    public async Task SendAsync(
        string fromEmail,
        string appPassword,
        string toEmail,
        string subject,
        string body,
        string? cvFilePath,
        string? cvFileName,
        CancellationToken cancellationToken)
    {
        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(fromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;

        var builder = new BodyBuilder
        {
            TextBody = body
        };

        if (!string.IsNullOrWhiteSpace(cvFilePath)
            && File.Exists(cvFilePath)
            && string.Equals(Path.GetExtension(cvFilePath), ".pdf", StringComparison.OrdinalIgnoreCase))
        {
            var fileName = string.IsNullOrWhiteSpace(cvFileName) ? Path.GetFileName(cvFilePath) : cvFileName;
            var fileBytes = await File.ReadAllBytesAsync(cvFilePath, cancellationToken);
            builder.Attachments.Add(fileName, fileBytes, new ContentType("application", "pdf"));
        }

        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls, cancellationToken);
        await client.AuthenticateAsync(fromEmail, appPassword, cancellationToken);
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}
