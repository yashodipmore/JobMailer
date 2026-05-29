# Secrets Management — JobMail AI

## ⚠️ Golden Rules
1. **NEVER commit secrets to Git** — add all files below to `.gitignore`
2. Gmail App Password is stored **encrypted in DB**, never returned to frontend
3. Groq API Key lives only on the backend server

---

## Backend Secrets (Development)

Use **.NET User Secrets** during local development:

```bash
cd backend/JobMailApi
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Postgres" "Host=localhost;Port=5432;Database=jobmail;Username=postgres;Password=yourpassword"
dotnet user-secrets set "Jwt:Key" "your-super-secret-jwt-key-min-32-chars"
dotnet user-secrets set "Groq:ApiKey" "gsk_..."
dotnet user-secrets set "Encryption:Key" "32-char-key-for-AES-encryption!!"
```

## Backend Secrets (Production)

Use **Environment Variables** on the server:

```
CONNECTIONSTRINGS__POSTGRES=Host=...
JWT__KEY=...
GROQ__APIKEY=gsk_...
ENCRYPTION__KEY=...
```

## Example Env Files

- Backend: `backend/JobMailApi/.env.example`
- Frontend: `frontend/jobmail-ui/.env.example`

---

## Gmail App Password — How It Works

1. User provides their Gmail address + Gmail **App Password** during registration
2. Backend **encrypts** the App Password using AES-256 before storing in DB
3. When sending mail, backend **decrypts** in-memory, uses it for SMTP, then discards
4. Frontend **never receives** the App Password — not even masked

### Encryption Approach (Backend)
```csharp
// AES-256-CBC encryption using Encryption:Key from secrets
// Store: Base64(IV + CipherText) in DB column
// Column: Users.GmailAppPasswordEncrypted (text)
```

---

## .gitignore Entries (Critical)

```
# .NET
**/appsettings.*.json
**/secrets.json
**/.env

# Frontend
.env
.env.local
.env.production

# Docker
docker-compose.override.yml
```

---

## Database Columns Holding Sensitive Data

| Table | Column | Storage Format |
|---|---|---|
| Users | GmailAppPasswordEncrypted | AES-256 encrypted, Base64 |
| Users | PasswordHash | BCrypt hash |

**No other sensitive data stored.**
