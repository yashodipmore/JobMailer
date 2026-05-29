namespace JobMailApi.Contracts;

public record ChatMessageRequest(string Message, string? SessionId);

public record EmailDraft(string Subject, string Body, string ToEmail);

public record ChatMessageResponse(string Reply, EmailDraft? EmailDraft);
