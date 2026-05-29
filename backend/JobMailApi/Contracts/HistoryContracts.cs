namespace JobMailApi.Contracts;

public record EmailHistoryResponse(Guid Id, string ToEmail, string Subject, DateTime SentAt);
