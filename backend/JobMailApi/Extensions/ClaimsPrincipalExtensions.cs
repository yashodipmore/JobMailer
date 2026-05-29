using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace JobMailApi.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(sub))
        {
            throw new InvalidOperationException("User id claim is missing.");
        }

        return Guid.Parse(sub);
    }
}
