# Progress Tracker — JobMail AI

> Update this file as you complete tasks. Use ✅ for done, 🔄 for in progress, ⬜ for pending.

---

## Phase 1 — Project Setup & DB

| Task | Status | Notes |
|---|---|---|
| Folder structure created | ✅ | |
| docker-compose.yml with Postgres | ✅ | |
| Postgres running locally | ✅ | |
| .NET project initialized | ✅ | |
| NuGet packages installed | ✅ | |
| AppDbContext + models created | ✅ | |
| First EF migration run | ✅ | |
| React + Vite project initialized | ✅ | |
| antd + axios + react-router installed | ✅ | |
| Basic routes working (/login, /register, etc.) | ✅ | |

---

## Phase 2 — Auth

| Task | Status | Notes |
|---|---|---|
| POST /api/auth/register | ✅ | |
| POST /api/auth/login | ✅ | |
| GET /api/auth/me | ✅ | |
| JWT middleware configured | ✅ | |
| Register page (frontend) | ✅ | |
| Login page (frontend) | ✅ | |
| AuthContext working | ✅ | |
| Protected routes working | ✅ | |

---

## Phase 3 — Candidate Profile

| Task | Status | Notes |
|---|---|---|
| GET /api/profile | ✅ | |
| PUT /api/profile | ✅ | |
| Profile page with all sections | ✅ | |
| Dynamic lists (experience, projects) | ✅ | |
| Profile save + toast | ✅ | |

---

## Phase 4 — AI Chat

| Task | Status | Notes |
|---|---|---|
| POST /api/chat/message | ✅ | |
| Groq API integration | ✅ | |
| System prompt with candidate data | ✅ | |
| Email marker parsing | ✅ | |
| POST /api/chat/send-email | ✅ | |
| MailKit SMTP sending | ✅ | |
| Chat UI (message list) | ✅ | |
| EmailPreview card | ✅ | |
| Send email button flow | ✅ | |

---

## Phase 5 — Polish

| Task | Status | Notes |
|---|---|---|
| Error handling (backend) | ✅ | |
| Error handling (frontend) | ✅ | |
| Loading states | ✅ | |
| Empty state (no profile) | ✅ | |
| End-to-end test | ✅ | |

---

## Bugs / Issues Log

| # | Description | Status |
|---|---|---|
| — | — | — |

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | ❌ | Create account |
| POST | /api/auth/login | ❌ | Get JWT |
| GET | /api/auth/me | ✅ | Get logged-in user |
| GET | /api/profile | ✅ | Get candidate profile |
| PUT | /api/profile | ✅ | Create/update profile |
| POST | /api/chat/message | ✅ | Send message to AI |
| POST | /api/chat/send-email | ✅ | Send generated email |
