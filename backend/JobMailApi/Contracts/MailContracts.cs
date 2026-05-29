namespace JobMailApi.Contracts;

public record SendEmailRequest(string ToEmail, string Subject, string Body, bool IncludeCv);
