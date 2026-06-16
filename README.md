# KLLM's Dashboard

A private dashboard for podcast hosting — research guests, generate questions, draft outreach emails.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Gemini (Google AI Studio) · Notion (auth/user store) · Vercel

## Features
- 🔐 Email + password login (Notion-backed user store, single-user friendly)
- 🔍 **Research** a guest with web search (Gemini grounding + Tavily/SerpAPI fallback). Also accepts pasted LinkedIn text.
- 🎙️ **Question generator** — slider for duration or number of questions
- ✉️ **Email drafter** — outreach & follow-ups, one-click copy
- 🏆 **IITM BS outreach** — find students with notable achievements, draft a podcast invite
- 🧠 **Model picker** — Gemini models, persisted per user

## Setup

```bash
cp .env.example .env.local
# fill in the values
npm install
npm run dev
```

### Notion setup
1. Create an internal Notion integration, share the target page/db with it.
2. Create a database with these properties:
   - `Email` (Title)
   - `PasswordHash` (Text)
   - `Name` (Text)
   - `Role` (Select: admin, user)
3. Set `NOTION_USERS_DB_ID` to that database's id.

### Seed first admin
Set `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` in `.env.local`. The first call to `/api/auth/login` with those credentials creates the Notion row. Then **change the password** via the UI (or remove the seed env vars).

## Deploy
Push to GitHub → import in Vercel → add the env vars from `.env.example` → deploy.
