# JobMail AI

> Paste a LinkedIn job post → AI writes a professional application email → sends it via your Gmail. Done.

---

## What This Does

1. **Register** with your Gmail + Gmail App Password (encrypted, never visible again)
2. **Fill your profile** once — experience, skills, projects, CV text
3. **Open Chat** → paste any LinkedIn job post
4. **AI reads the JD**, uses your profile, writes a short professional email
5. If anything's unclear, it asks. Otherwise → **sends directly from your Gmail**

---

## Docs

| File | Purpose |
|---|---|
| [TECHSTACK.md](./TECHSTACK.md) | Full tech stack with reasons |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Step-by-step development roadmap + folder structure |
| [TRACKING.md](./TRACKING.md) | Progress tracker — update as you build |
| [SECRETS.md](./SECRETS.md) | How secrets are managed, what goes where |
| [SKILL.md](./SKILL.md) | Full feature spec — what each feature does |

---

## Quick Start (Dev)

```bash
# 1. Start Postgres
docker-compose up -d

# 2. Run backend
cd backend/JobMailApi
dotnet user-secrets set "ConnectionStrings:Postgres" "Host=localhost;..."
dotnet user-secrets set "Jwt:Key" "your-32-char-key"
dotnet user-secrets set "Groq:ApiKey" "gsk_..."
dotnet user-secrets set "Encryption:Key" "32-char-encryption-key!!!!!!!!"
dotnet run

# 3. Run frontend
cd frontend/jobmail-ui
npm install
npm run dev
```

---

## DB Models (Quick Reference)

### Users
- Id, FullName, Email, PasswordHash
- GmailAddress, GmailAppPasswordEncrypted
- CreatedAt

### CandidateProfiles
- Id, UserId (FK)
- FullName, CurrentRole, YearsOfExperience, Location
- Objective, Skills (text)
- ExperienceJson, ProjectsJson, EducationJson (JSON columns)
- Achievements, OpenSourceContributions
- CvRawText
- UpdatedAt
