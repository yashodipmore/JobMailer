# Development Roadmap — JobMail AI

## Project Structure

```
jobmail-ai/
├── backend/
│   └── JobMailApi/              # .NET 8 Web API
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── ProfileController.cs
│       │   └── ChatController.cs
│       ├── Models/
│       │   ├── User.cs
│       │   └── CandidateProfile.cs
│       ├── Services/
│       │   ├── AuthService.cs
│       │   ├── EncryptionService.cs
│       │   ├── GroqService.cs
│       │   └── MailService.cs
│       ├── Data/
│       │   └── AppDbContext.cs
│       ├── appsettings.json      # no secrets here
│       └── Program.cs
│
├── frontend/
│   └── jobmail-ui/              # React + Vite
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Register.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── Profile.jsx
│       │   │   └── Chat.jsx
│       │   ├── components/
│       │   │   ├── ChatWindow.jsx
│       │   │   ├── MessageBubble.jsx
│       │   │   └── EmailPreview.jsx
│       │   ├── services/
│       │   │   └── api.js        # Axios instance
│       │   ├── context/
│       │   │   └── AuthContext.jsx
│       │   └── App.jsx
│       └── package.json
│
├── docker-compose.yml           # PostgreSQL only
└── README.md
```

---

## Phase 1 — Project Setup & DB

### Step 1.1 — Init Repos & Docker
- [ ] Create folder structure above
- [ ] `docker-compose.yml` with `postgres:15-alpine`
- [ ] Test DB connection

### Step 1.2 — .NET Backend Init
- [ ] `dotnet new webapi -n JobMailApi`
- [ ] Install NuGet packages:
  - `Npgsql.EntityFrameworkCore.PostgreSQL`
  - `Microsoft.AspNetCore.Authentication.JwtBearer`
  - `BCrypt.Net-Next`
  - `MailKit`
  - Groq API via `HttpClient`
- [ ] Setup `AppDbContext`, add `Users` and `CandidateProfiles` tables
- [ ] Run first migration: `dotnet ef migrations add Init`

### Step 1.3 — Frontend Init
- [ ] `npm create vite@latest jobmail-ui -- --template react`
- [ ] Install: `antd`, `axios`, `react-router-dom`
- [ ] Setup basic routing: `/login`, `/register`, `/profile`, `/chat`

---

## Phase 2 — Auth (Register + Login)

### Backend
- [ ] `POST /api/auth/register` — hash password, encrypt app password, save user
- [ ] `POST /api/auth/login` — verify password, return JWT
- [ ] `GET /api/auth/me` — return logged-in user info (no sensitive fields)

### Frontend
- [ ] Register page — Ant Design Form, all fields including Gmail + App Password
- [ ] Login page
- [ ] AuthContext — store JWT, expose `user`, `login()`, `logout()`
- [ ] Protected route wrapper

---

## Phase 3 — Candidate Profile

### Backend
- [ ] `GET /api/profile` — get current user's profile
- [ ] `PUT /api/profile` — upsert profile (create or update)

### Frontend
- [ ] Profile page with Ant Design Form
- [ ] Sections: Basic Info, Objective, Skills, Experience (dynamic list), Projects (dynamic list), Education, Achievements, Open Source, CV Raw Text (textarea)
- [ ] Save button → PUT /api/profile
- [ ] Show success toast on save

---

## Phase 4 — AI Chat Interface

### Backend — Groq Integration
- [ ] `POST /api/chat/message`
  - Input: `{ message: string, sessionId?: string }`
  - Build system prompt from candidate profile
  - Send to Groq API
  - Parse response: detect if Groq is asking a question OR generated an email
  - If email detected in response, extract `subject` and `body`
  - Return: `{ reply: string, emailDraft?: { subject, body, toEmail } }`

### Backend — Email Sending
- [ ] `POST /api/chat/send-email`
  - Input: `{ subject, body, toEmail }`
  - Decrypt Gmail app password
  - Send via MailKit SMTP
  - Return success/failure

### Frontend
- [ ] Chat page layout (Ant Design, simple)
- [ ] Chat message list with user + AI bubbles
- [ ] Input box with send button + optional file upload (CV PDF → send text to backend)
- [ ] When AI response contains email draft → show `EmailPreview` card with "Send" button
- [ ] "Send" → POST /api/chat/send-email → show success/error

---

## Phase 5 — Polish & Testing

- [ ] Error handling throughout (network errors, Groq failures, SMTP errors)
- [ ] Loading states on all async actions
- [ ] Empty states (new user with no profile → prompt to fill profile)
- [ ] Basic input validation
- [ ] Test full flow end-to-end: Register → Fill Profile → Paste JD → Get Email → Send

---

## Groq System Prompt Design

```
You are a professional job application email assistant.

Candidate Profile:
- Name: {name}
- Role: {currentRole}
- Experience: {yearsOfExperience} years
- Skills: {skills}
- Objective: {objective}
- Key Projects: {projects}
- Achievements: {achievements}

Instructions:
1. Read the job post the user provides.
2. Extract the hiring manager's email from the post if present.
3. Write a SHORT, professional application email (3-4 paragraphs max).
4. If no email is found in the post, ask the user for the recipient's email.
5. If anything critical is unclear, ask ONE question at a time.
6. When you generate the final email, format it exactly like this:

---EMAIL_START---
TO: email@example.com
SUBJECT: Application for [Role] — [Candidate Name]

[email body here]
---EMAIL_END---
```

The backend will parse between `---EMAIL_START---` and `---EMAIL_END---` markers.
