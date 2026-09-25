# CityVoice AI 🏙️🎙️

> **Your city, one conversation away.**

CityVoice AI is a voice-first civic technology platform that lets citizens interact with city services naturally — through speech or text — to report problems, track requests, find transport, locate emergency facilities, and more.

---

## 🚀 Problem

Citizens face fragmented, opaque, and difficult-to-use government service portals. Reporting a pothole, checking a complaint status, or finding the nearest hospital often requires navigating multiple departments and apps.

---

## 💡 Solution

CityVoice AI provides a single, multilingual, voice-first interface to all city services. Citizens speak naturally; CityVoice understands, verifies, and acts — confirming every important action before executing it.

---

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🎙️ Voice-first civic assistance | Speak your request naturally in English, Tamil, or Telugu |
| 📋 Civic complaint registration | Report potholes, garbage overflow, broken streetlights, water leaks |
| 🚌 Smart mobility assistance | Get live bus schedules, route stops, and ETAs |
| 🚑 Emergency facility discovery | Find the nearest hospital, police station, or fire station |
| 📊 Request tracking | Check the status and SLA of any previous complaint |
| 🌐 Multilingual interaction | Full UI + voice pipeline in English, Tamil, and Telugu |
| 🤖 Tool-based workflow execution | AI verifies intent → selects tool → confirms → executes |
| 🏛️ City Operations Dashboard | Operators can view, filter, and update all citizen requests |

---

## 🏗️ Architecture

\\\
Citizen
  ↓
React UI / Voice Interface
  ↓
Conversation + Context (ConversationEngine / CivicContext)
  ↓
Intent Engine (CivicAIEngine)
  ↓
Workflow Orchestrator
  ↓
Tool Registry (registered, validated tools)
  ↓
Service Layer (city services / repositories)
  ↓
Supabase / External APIs
  ↓
Result
  ↓
Voice + Text Confirmation
\\\

### Provider Abstraction

\\\
VoiceProvider
├── MockVoiceProvider          (demo/development)
├── WebSpeechVoiceProvider     (browser Web Speech API)
└── SharyXVoiceProvider        (production SharyX integration)

CityServiceProvider
├── MockCityServiceProvider    (demo/development)
├── SupabaseCityServiceProvider
└── SharyXCityServiceProvider  (production)
\\\

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Vanilla CSS (design system) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Voice | Web Speech API + SharyX adapter |
| State | React Context (CivicContext) |
| Localization | Custom translation service (en / ta / te) |
| Icons | Lucide React |
| AI Orchestration | Custom intent engine + tool registry + workflow orchestrator |

---

## ⚡ Local Setup

\\\ash
git clone https://github.com/BudarajuJaswanth/Shary-X-Hackathon.git
cd Shary-X-Hackathon
npm install
cp .env.example .env
# Fill in environment variables
npm run dev
\\\

Open http://localhost:5173 in your browser.

---

## 🌍 Environment Variables

\\\env
# Voice provider: webspeech | mock | sharyx
VITE_VOICE_PROVIDER=webspeech

# City service provider: supabase | mock
VITE_CITY_PROVIDER=supabase

# Default language: en-IN | ta-IN | te-IN
VITE_DEFAULT_LANG=en-IN

# Supabase (public anon key — safe for frontend)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# SharyX (optional — leave blank for demo/mock mode)
# VITE_SHARYX_API_KEY=
\\\

> Security Note: The Supabase anon key is intentionally public (protected by Row Level Security). For production SharyX integration, obtain a short-lived token from a secure backend endpoint — never commit real API keys.

---

## 🎭 Demo Mode

When VITE_SHARYX_API_KEY is not set:
- App uses the browser Web Speech API for voice recognition
- City-service calls fall back to MockCityServiceProvider
- Data is stored in localStorage for the session
- UI labels clearly state Demo wherever mock data is shown

---

## 🔒 Security

| Concern | Approach |
|---------|---------|
| Secrets | No API keys or service-role keys in frontend code |
| Supabase | Public anon key only; service-role key stays server-side |
| Row Level Security | All tables enforce RLS policies (see supabase/schema.sql) |
| Input validation | Every tool validates inputs via JSON schema before execution |
| Tool confirmation | registerComplaint and action tools require explicit citizen confirmation |
| XSS | No dangerouslySetInnerHTML usage |
| LLM safety | Intent engine cannot bypass validation or authorization |
| Storage | Only mock session data in localStorage; no credentials stored |
| Microphone | Permission requested only on user action; stream stopped after use |

---

## 🌐 Multilingual Support

| Language | Code | Status |
|----------|------|--------|
| English (India) | en-IN | Full support |
| Tamil | ta-IN | Full support |
| Telugu | te-IN | Full support |

---

## 🚢 Production Deployment

The output of npm run build is a static site in dist/. Deploy to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

Recommended security headers:
\\\
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\\\

---

## 🎬 Hackathon Demo Flow

1. Home page — multilingual greeting, quick-action cards, voice sphere
2. Voice complaint — say a pothole report → confirm → ticket created
3. Request tracking — ask for status → AI pulls the ticket
4. Smart Mobility — ask for next bus → Demo ETA shown
5. Emergency — ask for nearest hospital → Demo facility list
6. Language switch — Tamil voice complaint
7. Operations Dashboard — admin view of all requests

---

## 📦 Build Commands

\\\ash
npm run dev       # Development server
npm run build     # Production build → dist/
npm run preview   # Preview production build
\\\

---

## 📁 Project Structure

\\\
src/
├── components/        # UI components
├── config/            # Language config, feature flags
├── context/           # CivicContext — global state
├── domain/            # Core domain models
├── hooks/             # Custom React hooks
├── layouts/           # App layout wrappers
├── lib/               # Utility libraries
├── pages/             # Full page components
├── providers/         # Voice + city service providers
├── services/
│   ├── ai/            # Intent engine
│   ├── cityServices/  # City service providers
│   ├── database/      # Supabase client + repository
│   ├── emergency/     # Emergency workflow
│   ├── mobility/      # Mobility workflow
│   ├── tools/         # Tool registry and tools
│   └── workflow/      # Workflow orchestrator
├── types/             # TypeScript types
└── utils/             # Helpers
supabase/
└── schema.sql         # Database schema + RLS policies
\\\

---

## 🏆 Built For

**VoiceOps 2026 Hackathon** — Civic Technology / AI Voice Interfaces

---

## 👤 Author

**Budaraju Jaswanth**
GitHub: [@BudarajuJaswanth](https://github.com/BudarajuJaswanth)

---

## 📄 License

MIT License
