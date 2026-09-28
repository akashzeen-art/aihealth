# CareGuide

**CareGuide** is an educational AI health companion app. It helps people ask health-related questions in plain language through specialized assistants — with clear safety boundaries that this is **not medical advice, diagnosis, or emergency care**.

The app runs as a **frontend-only** React application. Auth, chats, and documents are stored in the browser (`localStorage`). AI replies are generated via the **OpenAI Chat Completions API**. No Spring Boot backend or database is required.

> **Important:** CareGuide provides general health education only. It is not a doctor, not a diagnosis tool, and not a substitute for professional medical care. For emergencies, contact local emergency services immediately.

---

## Table of contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Features](#features)
4. [AI assistants](#ai-assistants)
5. [Medical safety & disclaimers](#medical-safety--disclaimers)
6. [Architecture](#architecture)
7. [Project structure](#project-structure)
8. [Getting started](#getting-started)
9. [Environment variables](#environment-variables)
10. [Routes & navigation](#routes--navigation)
11. [Data storage](#data-storage)
12. [Scripts](#scripts)
13. [Limitations](#limitations)
14. [License / disclaimer](#license--disclaimer)

---

## Overview

CareGuide is designed as a demo-ready educational product where a user can:

1. Sign in with a **mobile number** (demo login — no password, no separate signup)
2. Acknowledge medical safety onboarding
3. Choose one of **six specialized AI assistants**
4. Chat in their preferred language
5. Optionally upload medical documents (PDF / images) for plain-language explanation
6. Review chat history and update their profile

All conversational data stays on the user’s device until they clear browser storage. AI generation still requires a configured OpenAI API key.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript |
| Build / dev server | Vite 8 |
| Routing | React Router DOM 7 |
| State | Zustand |
| Styling | Tailwind CSS 4 + custom CSS (`index.css`) |
| Markdown replies | `react-markdown` + `remark-gfm` |
| AI | OpenAI Chat Completions (`gpt-4o-mini` by default) |
| Persistence | Browser `localStorage` |
| Lint | Oxlint |

There is an empty `backend/` folder in the repo for future use. The current product does **not** depend on it.

---

## Features

### 1. Demo mobile login

- Route: `/login`
- User enters a **mobile number** (10–15 digits; `+91` / leading `0` are normalized)
- No password and **no signup page**
- First use of a number creates a local demo account automatically
- `/register` redirects to `/login`
- Landing page, navbar, and footer CTAs point to login only

### 2. Landing & branding

- Public landing page with CareGuide branding and product tagline
- Preloader on first load
- Consistent brand copy via `src/brand.ts`

### 3. Home dashboard

- Personalized welcome
- Grid of all assistants with quick start links
- Recent chats (last few conversations)
- Persistent medical disclaimer banner

### 4. Assistants hub

- Full catalog of companions at `/assistants`
- Each card shows name, description, and safety note
- Opens a dedicated chat experience per assistant

### 5. Conversational chat

- Create / continue / delete conversations
- Conversation sidebar for switching threads
- Message bubbles with Markdown rendering (headings, lists, emphasis)
- Typing indicator while the model responds
- Language selector (English, Hindi, French, Swahili, Arabic)
- Country / language from the user profile are passed into system prompts for more relevant answers
- Recent chat history (last ~16 turns) is sent with each request for context
- Emergency-style prompts for First-Aid and other high-risk assistants

### 6. Chat history

- Route: `/history`
- Lists all past conversations across assistants
- Open any chat to continue, or delete conversations you no longer need

### 7. Medical document reader

- Route: `/document-reader`
- Upload PDF or image files (`.pdf`, `.jpg`, `.jpeg`, `.png`)
- Client-side text extraction when possible
- Stored document list with preview / delete
- Continues into **Document Reader** assistant chat for explanations and follow-ups
- Flow: **Upload → Extract → AI explanation → Follow-up questions**

### 8. Profile

- Route: `/profile`
- Update display name, phone, country, and preferred language
- Preferences influence how assistants reply (language + local examples)

### 9. Safety & about

- `/safety` — full medical safety disclaimers and principles
- `/about` — product context and how to get started
- Safety onboarding gate before using protected app areas
- Per-assistant safety acknowledgement where configured

### 10. Responsive app shell

- Top navbar (desktop) with brand, nav links, and sign out
- Bottom navigation on smaller screens (Home, Assistants, History, Docs, Profile)
- Footer with secondary links
- Protected routes redirect guests to `/login`

---

## AI assistants

CareGuide ships six specialized companions. Each has its own system prompt with structured answer formats and shared safety rules.

| Assistant | Slug | Purpose |
| --- | --- | --- |
| **Health Companion** | `health` | General health education; clarifying questions; when to see a clinician |
| **First-Aid Guide** | `first-aid` | Ordered educational first-aid steps; emergency escalation |
| **Mother & Baby** | `mother-baby` | Pregnancy, newborn, breastfeeding, parenting education |
| **Nutrition Coach** | `nutrition` | Practical meal ideas with local-food preference |
| **Health Translator** | `translator` | Plain-language explanations of medical terms (+ translation) |
| **Document Reader** | `document-reader` | Explains uploaded reports / prescriptions from extracted text |

### Shared assistant behaviors

- Educational tone only — no fabricated diagnoses, dosages, or citations
- Markdown-formatted replies (short sections, bullets, numbered steps)
- **Emergency:** / **Warning:** style callouts when severe symptoms are described
- Prefer asking clarifying questions when key details are missing
- Encourage clinicians for severe, persistent, worsening, or high-risk concerns

---

## Medical safety & disclaimers

Safety is a first-class product feature, not an afterthought.

| Mechanism | What it does |
| --- | --- |
| **Onboarding gate** | After login, users must acknowledge educational-only principles before using the app |
| **Disclaimer banner** | Short reminder on home and related screens |
| **Assistant safety gate** | Extra acknowledgement for assistants that require it |
| **Emergency alert UI** | Prominent warning on assistants like First-Aid |
| **System prompts** | Hard-coded safety rules injected into every OpenAI request |
| **Safety page** | Full disclaimer text, principles, and items |

Core principles include:

- Educational information only — not a diagnosis or treatment plan
- Not a substitute for professional medical care
- Call local emergency services for life-threatening symptoms
- Do not rely on AI for medication dosing decisions

---

## Architecture

```
┌─────────────────────┐
│   Browser (React)   │
│  Vite + Zustand UI  │
└─────────┬───────────┘
          │
          ├── localStorage
          │     • demo auth / user profile
          │     • conversations & messages
          │     • uploaded document metadata + extracted text
          │     • safety acknowledgement flags
          │
          └── Vite proxy `/openai-proxy` ──► OpenAI API
                (avoids browser CORS)
```

### Request flow (chat)

1. User sends a message in an assistant conversation
2. Message is saved to that user’s local conversation history
3. App builds a system prompt for the assistant (+ language, country, document context)
4. Recent turns are sent to OpenAI via the Vite proxy
5. Assistant reply is saved locally and rendered as Markdown

### Auth flow (demo)

1. User enters mobile number on `/login`
2. Number is normalized and validated
3. Existing local account is reused, or a new demo user is created
4. Access / refresh tokens (local placeholders) and user JSON are stored in `localStorage`
5. Protected routes become available; safety onboarding may still be required

---

## Project structure

```
health/
├── README.md                 # This file
├── backend/                  # Empty placeholder (not used)
└── frontend/
    ├── .env.example          # OpenAI env template
    ├── index.html
    ├── package.json
    ├── vite.config.ts        # Dev server + OpenAI proxy
    ├── public/               # Static assets (favicon, icons)
    └── src/
        ├── App.tsx           # Routes
        ├── main.tsx
        ├── brand.ts          # Product name / tagline
        ├── index.css         # Global styles
        ├── pages/            # Route screens
        ├── layouts/          # AppShell, Navbar, Footer
        ├── components/
        │   ├── assistants/   # Cards, icons, grid
        │   ├── chat/         # Chat window, bubbles, sidebar
        │   ├── common/       # Safety gates, uploader, nav, alerts
        │   ├── home/         # Optional dashboard visuals
        │   └── ui/           # Button, Input
        ├── services/         # Auth, chat, documents, OpenAI, profile
        ├── store/            # Zustand (auth, medical safety)
        ├── local/            # localStorage helpers & static disclaimers
        ├── prompts/          # Per-assistant system prompts
        ├── hooks/
        ├── utils/            # Assistant catalog, errors, formatting
        └── types/            # Shared TypeScript types
```

---

## Getting started

### Prerequisites

- **Node.js** 18+ (recommended: current LTS)
- An **OpenAI API key** with access to chat completions
- npm (comes with Node)

### Install & run

```bash
cd frontend
cp .env.example .env
# Edit .env and set VITE_OPENAI_API_KEY

npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).

### First-time usage

1. Open the landing page → **Login with mobile**
2. Enter any valid mobile number (e.g. `9876543210`)
3. Accept the medical safety acknowledgement
4. Choose an assistant and start chatting

---

## Environment variables

Copy `frontend/.env.example` to `frontend/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_OPENAI_API_KEY` | Yes | OpenAI API key (`sk-…`) |
| `VITE_OPENAI_MODEL` | No | Model id (default: `gpt-4o-mini`) |
| `VITE_OPENAI_BASE_URL` | No | Override API base (default: `/openai-proxy` via Vite) |

Restart `npm run dev` after changing env values.

> **Security note:** Keys prefixed with `VITE_` are exposed to the browser bundle. This setup is intended for local demos. Do not ship a production client with a secret API key embedded — use a backend proxy with proper auth and rate limits instead.

---

## Routes & navigation

| Path | Access | Description |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Guest | Demo mobile login |
| `/register` | — | Redirects to `/login` |
| `/safety` | Public | Full medical disclaimers |
| `/about` | Auth | About CareGuide |
| `/dashboard` | Auth + safety | Home |
| `/assistants` | Auth + safety | All assistants |
| `/assistant/:slug` | Auth + safety | Chat with an assistant |
| `/assistant/:slug/:conversationId` | Auth + safety | Resume a conversation |
| `/history` | Auth + safety | Chat history |
| `/document-reader` | Auth + safety | Upload & explain documents |
| `/profile` | Auth + safety | User preferences |

Legacy `/app/*` paths redirect to the current routes (e.g. `/app` → `/dashboard`).

---

## Data storage

Everything is stored in the browser under CareGuide-prefixed keys, including:

| Key / prefix | Contents |
| --- | --- |
| `careguide_token` / `careguide_refresh` | Demo session tokens |
| `careguide_user` | Current user profile JSON |
| `careguide_users_v1` | Local accounts (keyed by mobile) |
| `careguide_data_v1_<userId>` | That user’s conversations & documents |
| Medical safety store keys | Onboarding acknowledgement state |

Clearing site data / localStorage signs the user out and removes chats and documents for that browser profile.

---

## Scripts

From `frontend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server (port 5173) |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

---

## Limitations

- **Demo auth only** — mobile number login with no OTP, password, or server verification
- **Browser-only persistence** — data does not sync across devices; clearing storage loses history
- **Document extraction is best-effort** — PDFs/images may extract poorly; users can paste key lines into chat
- **OpenAI key in the client** — suitable for demos, not production multi-user deployments
- **Not clinical software** — must not be used for diagnosis, prescribing, or emergency dispatch
- **Empty `backend/`** — no server APIs, auth service, or database in this repo yet

---

## License / disclaimer

This project is provided for **educational and demonstration purposes**.

CareGuide assistants share general health education. AI replies can be incomplete or incorrect. Always verify important health decisions with a qualified clinician. For severe or life-threatening symptoms, seek urgent in-person care or call local emergency services.
