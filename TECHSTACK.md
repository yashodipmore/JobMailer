# Tech Stack — JobMail AI

## Frontend
| Layer | Technology | Reason |
|---|---|---|
| Framework | **React 18 + Vite** | Fast dev, easy component reuse |
| Routing | **React Router v6** | SPA routing |
| UI Library | **Ant Design (antd)** | Ready-made components, zero custom CSS needed |
| HTTP Client | **Axios** | Clean API calls |
| State | **React Context + useReducer** | Simple enough for now, no Redux overhead |
| Auth Token | **localStorage (JWT)** | Simple, upgrade to httpOnly cookie later |

## Backend
| Layer | Technology | Reason |
|---|---|---|
| Framework | **.NET 8 Web API (C#)** | Strong typing, great for structured data |
| ORM | **Entity Framework Core** | Easy PostgreSQL integration |
| Auth | **JWT Bearer Tokens** | Stateless, scalable |
| AI Integration | **Groq API (Llama 3.1 / Mixtral)** | Mail generation + conversation |
| Email Sending | **MailKit / MimeKit** | Send via Gmail SMTP using App Password |
| Secrets | **User Secrets (dev) / Env Vars (prod)** | Never hardcode credentials |

## Database
| Layer | Technology |
|---|---|
| DB | **PostgreSQL 15+** |
| Hosting (local dev) | Docker (`postgres:15-alpine`) |
| Migrations | EF Core Migrations |

## Infrastructure (Dev)
- Docker Compose for local PostgreSQL
- `.env` file for backend secrets
- CORS configured for `localhost:5173` (Vite dev server)

## Key External APIs
- **Groq API** — Llama 3.1 / Mixtral for mail generation
- **Gmail SMTP** — `smtp.gmail.com:587` (STARTTLS) with App Password

---

## Architecture Overview

```
[React Frontend (Vite)]
        |
        | HTTPS / REST
        v
[.NET 8 Web API]
   |          |
   |          v
   |     [Groq API] — generates professional mail
   |
   v
[PostgreSQL DB]
   - Users (email, hashed password, encrypted Gmail app password)
   - CandidateProfiles (CV text, experience, skills, etc.)
   - ChatSessions (optional: save history)
```
