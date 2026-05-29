# Feature Specification — JobMail AI

## Core Features

---

### 1. User Registration & Auth

**Registration Fields:**
- Full Name
- Email (their own email, used for login)
- Password
- Gmail Address (the Gmail they'll send from — could be same or different)
- Gmail App Password (immediately encrypted, never shown again)

**Login:**
- Email + Password → returns JWT token
- Token stored in localStorage on frontend

**Notes:**
- Gmail App Password shown only during registration input (type="password")
- After save, it's gone from UI — user sees only "Gmail connected ✓"
- Password hashed with BCrypt

---

### 2. Candidate Profile

Filled once, reused for every mail. Fields:

| Section | Fields |
|---|---|
| Basic | Full Name, Current Role/Title, Years of Experience, Location |
| Objective | Career objective / summary (2-3 lines) |
| Skills | Comma-separated or tag input |
| Experience | Company, Role, Duration, Key achievements (repeatable) |
| Projects | Name, Description, Tech Stack, Link (repeatable) |
| Education | Degree, College, Year (repeatable) |
| Achievements | List of achievements / awards |
| Open Source | GitHub profile, notable contributions |
| CV Raw Text | Full CV pasted as plain text (used as primary context for AI) |

Profile is **editable anytime**. AI uses this data to personalize every mail.

---

### 3. AI Chat Interface (Main Feature)

**Layout:**
- Left/top: Chat window (like ChatGPT)
- CV/file upload button in chat input area

**User Flow:**
1. User pastes the LinkedIn job post (including JD + email) into chat
2. Optionally uploads CV PDF/file (parsed to text on backend)
3. Backend sends to Groq with:
   - System prompt: candidate profile data
   - User message: the job post
4. Groq either:
   - **Asks a clarifying question** if something is unclear (e.g., no email found in post)
   - **Generates the email directly** if all info is present
5. If email is generated, UI shows:
   - Preview of the email
   - "Send Now" button + "Edit before sending" option
6. On confirm → backend sends email via Gmail SMTP using stored App Password

**Email Format:**
- Subject line (auto-generated)
- Body: short, professional, 3-4 paragraphs max
- No resume attached unless user explicitly triggers it (Phase 2)

---

### 4. Mail Sending (Backend)

- Uses **MailKit** with Gmail SMTP (`smtp.gmail.com:587`, STARTTLS)
- Credentials: decrypted at send-time, never logged
- On success: show "Email sent! ✓" in chat
- On failure: show error, let user retry

---

## Out of Scope (Phase 1)

- CV file attachment in email (Phase 2)
- Multiple Gmail accounts
- Email history / sent log (Phase 2)
- Team/org accounts
- Analytics
