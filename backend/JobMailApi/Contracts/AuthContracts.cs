namespace JobMailApi.Contracts;

public record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    string GmailAddress,
    string GmailAppPassword);

public record LoginRequest(string Email, string Password);

public record AuthUserDto(
    Guid Id,
    string FullName,
    string Email,
    string GmailAddress,
    bool GmailConnected);

public record AuthResponse(AuthUserDto User, string Token);
