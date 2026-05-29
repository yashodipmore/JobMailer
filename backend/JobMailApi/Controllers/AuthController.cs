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
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwtService;
    private readonly EncryptionService _encryptionService;

    public AuthController(AppDbContext db, JwtService jwtService, EncryptionService encryptionService)
    {
        _db = db;
        _jwtService = jwtService;
        _encryptionService = encryptionService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var gmail = request.GmailAddress.Trim().ToLowerInvariant();

        if (await _db.Users.AnyAsync(u => u.Email == email))
        {
            return Conflict(new { message = "Email already registered." });
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            GmailAddress = gmail,
            GmailAppPasswordEncrypted = _encryptionService.Encrypt(request.GmailAppPassword),
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _jwtService.CreateToken(user);
        var response = new AuthResponse(ToDto(user), token);

        return Ok(response);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var token = _jwtService.CreateToken(user);
        var response = new AuthResponse(ToDto(user), token);

        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthUserDto>> Me()
    {
        var userId = User.GetUserId();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        return Ok(ToDto(user));
    }

    private static AuthUserDto ToDto(User user)
    {
        return new AuthUserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.GmailAddress,
            !string.IsNullOrWhiteSpace(user.GmailAppPasswordEncrypted));
    }
}
