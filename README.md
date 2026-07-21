# CarryOn

An AI-guided learning platform that transforms curiosity into structured knowledge journeys. CarryOn uses generative AI to break down any topic into progressive, visually rich learning steps, measures the learner's "wow factor," and uses that signal to decide what to teach next.

### Accelerated by OpenAI Codex CLI

This project was built at an accelerated pace using **OpenAI Codex CLI** as a core part of the development workflow. Codex CLI acted as a real-time pair-programming partner directly in the terminal, dramatically shortening iteration cycles across every phase of development. It was instrumental in **scaffolding the monorepo structure**, **configuring and deploying to Render**, **setting up Supabase authentication and database schemas**, and **working through architectural decisions** in back-and-forth discussion before writing a single line of code. Instead of context-switching between documentation tabs and the editor, Codex CLI kept the entire feedback loop inside the terminal -- propose an approach, discuss trade-offs, generate the code, test it, and ship. Features that would have taken days of research and trial-and-error were landed in hours.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Backend Setup (API)](#backend-setup-api)
  - [Frontend Setup (Web)](#frontend-setup-web)
  - [Running the Full Stack](#running-the-full-stack)
- [Environment Variables Reference](#environment-variables-reference)
- [Database Setup](#database-setup)
- [Deployment](#deployment)
- [API Contract](#api-contract)
- [Project Structure](#project-structure)
- [Built with OpenAI Codex and GPT-5.6](#built-with-openai-codex-and-gpt-56)
- [Known Bugs and Caveats](#known-bugs-and-caveats)
- [License](#license)

---

## Overview

CarryOn is a full-stack learning platform where a user types any question or topic, and the system returns a multi-step journey composed of AI-generated explanations, Mermaid diagrams, Wikipedia reference images, and contextual fun facts. After completing a journey, the learner reflects on how much the idea "landed" (the Wow Calculator), and CarryOn uses that reflection to generate a personalized next topic. A one-shot Curiosity Engine lets the learner select text or crop an image region mid-journey and ask the AI a single follow-up question about that detail.

The platform is built as a monorepo with a React frontend (Vite), an Express.js API backend, and shared packages for simulation algorithms, knowledge manifests, and cross-layer contracts. Authentication and data persistence are handled by Supabase.

---

## Architecture

```
carryon/
  apps/
    web/        -- React 19 + Vite frontend (visual UI only)
    api/        -- Express 5 backend (routing, AI, auth, images)
  packages/
    simulator-core/   -- Deterministic scheduling algorithms and tests
    knowledge-tools/  -- Human-authored manifests and curated references
    contracts/        -- Stable payload shapes and cross-layer helpers
  docs/               -- Architecture docs, API contract, SQL schema
```

Ownership boundaries are strictly enforced:

- `apps/web` handles rendering and user interaction. It never contains scheduling algorithms or AI prompts.
- `apps/api` owns topic routing, AI orchestration, image lookup, and HTTP endpoints. It never decides visual layout.
- `packages/simulator-core` contains deterministic algorithms (e.g., Round Robin CPU scheduling). It never imports browser or AI code.
- `packages/knowledge-tools` holds human-authored content manifests. It never calls an AI service.
- `packages/contracts` defines stable payload shapes shared between layers. Changes here require a matching update to `docs/api-contract.md`.

For the full boundary rules, see [docs/architecture.md](docs/architecture.md).

---

## Tech Stack

**Frontend**
- React 19.1 with JSX
- Vite 7.1 (dev server, HMR, production bundler)
- Mermaid 11.12 (diagram rendering)
- Supabase JS SDK (client-side auth)
- Vanilla CSS (36 KB stylesheet, no utility framework)

**Backend**
- Node.js 20+ (ESM modules throughout)
- Express 5.1
- Google Gemini AI (primary model: gemini-3.5-flash, fallback: gemini-3.1-flash-lite)
- Supabase (PostgreSQL database, Row Level Security, JWT auth)
- Pexels API (image search provider)
- Helmet, CORS, compression, morgan, express-rate-limit (security and logging middleware)

**Infrastructure**
- pnpm workspaces (monorepo management)
- Render (backend hosting, free tier)
- Supabase hosted PostgreSQL

---

## Features

**AI-Powered Learning Journeys**
Every topic is broken into three progressive steps: Foundation, How It Works, and See It In Context. Each step includes its own explanation, fun fact, and visual decision (Mermaid diagram, Wikipedia image, or text-only).

**Curiosity Engine**
During a journey, the learner can activate a one-shot curiosity check. They can select text anywhere on the page, or drag-select a region of a reference image. The selected context is sent to the AI for a focused, contextual explanation. This feature was built with the assistance of OpenAI Codex.

**Wow Calculator**
After completing a journey, the learner rates how much the idea "landed" on a 0-100 scale and selects qualitative reactions (Insight, Surprise, Connection, Possibility, Depth, or No Wow). The AI uses these signals to decide whether to deepen the current topic or rephrase it, and generates a personalized next topic with a three-item learning path. This feature was built with the assistance of OpenAI Codex.

**Visual Rendering**
The system intelligently decides between Mermaid diagrams (for processes, flows, algorithms), Wikipedia reference images (for real-world entities, places, technologies), and text-only mode (for abstract concepts). At least one step per journey includes a reference image.

**Authentication and Persistence**
Supabase handles email/password authentication with email confirmation. User journeys, conversations, and wow scores are persisted per user with Row Level Security policies.

**Conversation History**
The API maintains conversation context so follow-up queries build on previous interactions.

**Adaptive Learning Path**
The wow reflection engine determines `deepen` or `rephrase` learning modes and generates the next topic. Saved journeys are displayed on the home screen so the learner can pick up where they left off.

---

## Getting Started

### Prerequisites

- Node.js 20 or newer
- pnpm (recommended) or npm
- A Supabase project (free tier works)
- A Google Gemini API key
- A Pexels API key (for image search)

### Clone the Repository

```bash
git clone https://github.com/<your-username>/carryon.git
cd carryon
```

### Backend Setup (API)

1. Copy the example environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

2. Fill in the required values in `apps/api/.env`:

```
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
SUPABASE_JWT_SECRET=your-jwt-secret

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash
GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite

IMAGE_PROVIDER=pexels
IMAGE_API_KEY=your-pexels-api-key

FRONTEND_URL=http://localhost:5173

LOG_LEVEL=debug
```

3. Install backend dependencies:

```bash
cd apps/api
npm install
cd ../..
```

### Frontend Setup (Web)

1. Copy the example environment file:

```bash
cp apps/web/.env.example apps/web/.env
```

2. Fill in the required values in `apps/web/.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_API_URL=http://localhost:3000
```

3. Install frontend dependencies from the root:

```bash
pnpm install
```

### Running the Full Stack

From the project root, run both the API and the web dev server concurrently:

```bash
npm run dev
```

This starts:
- The API server at `http://localhost:3000`
- The Vite dev server at `http://localhost:5173`

The React client proxies API calls to the backend. Open `http://localhost:5173` in your browser.

### Running Tests

```bash
npm test
```

This runs the Node.js test suite for the API, including the deterministic Round Robin scheduling algorithm tests.

---

## Environment Variables Reference

### Backend (`apps/api/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | HTTP server port | Yes |
| `NODE_ENV` | `development` or `production` | Yes |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Yes |
| `SUPABASE_SECRET_KEY` | Supabase service role key | Yes |
| `SUPABASE_JWT_SECRET` | Supabase JWT signing secret | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `GEMINI_MODEL` | Primary Gemini model (default: `gemini-3.5-flash`) | No |
| `GEMINI_FALLBACK_MODEL` | Fallback model (default: `gemini-3.1-flash-lite`) | No |
| `IMAGE_PROVIDER` | Image search provider (default: `pexels`) | No |
| `IMAGE_API_KEY` | API key for the image provider | Yes |
| `FRONTEND_URL` | Frontend origin for CORS (default: `http://localhost:5173`) | Yes |
| `LOG_LEVEL` | Logging verbosity: `debug`, `info`, `warn`, `error` | No |

### Frontend (`apps/web/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Yes |
| `VITE_API_URL` | Backend API base URL (default: `http://localhost:3000`) | No |

---

## Database Setup

Run the SQL schema in your Supabase SQL Editor. The schema file is at [docs/supabase-journey.sql](docs/supabase-journey.sql).

This creates the following tables with Row Level Security enabled:

- `public.users` -- Mirrors `auth.users` with display name and avatar
- `public.conversations` -- Per-user conversation threads
- `public.messages` -- Individual messages within conversations
- `public.journeys` -- Learning journey records with wow scores, curiosity scores, and next topic suggestions

RLS policies ensure users can only read and write their own data.

---

## Deployment

The backend is configured for deployment on Render using the [render.yaml](render.yaml) blueprint:

- **Service type**: Web service (Node.js)
- **Root directory**: `apps/api`
- **Region**: Oregon
- **Plan**: Free
- **Build command**: `npm install`
- **Start command**: `npm start`
- **Health check**: `GET /health`

All secrets (Supabase credentials, Gemini API key, image API key) are configured as environment variables in the Render dashboard and are not committed to source control.

The frontend can be deployed to any static hosting provider (Vercel, Netlify, Cloudflare Pages) by running `npm run build` from the root and serving the `apps/web/dist` directory.

---

## API Contract

The full API contract is documented in [docs/api-contract.md](docs/api-contract.md). Key endpoints:

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/ai/chat` | Bearer token | Main learning journey generation |
| `POST` | `/api/v1/ai/curiosity` | Bearer token | One-shot curiosity follow-up (text or image) |
| `POST` | `/api/v1/ai/wow` | Bearer token | Wow reflection and next topic generation |
| `POST` | `/api/v1/journey` | Bearer token | Save a journey record |
| `GET` | `/api/v1/journey/latest` | Bearer token | Retrieve the latest saved journey |
| `POST` | `/api/resolve-topic` | None | Topic resolution (knowledge tool lookup) |
| `POST` | `/api/simulate` | None | Deterministic CPU scheduling simulation |
| `POST` | `/api/explain-trace` | None | AI-generated trace explanation |

All responses follow a consistent JSON envelope: `{ "status": "success", "data": { ... } }` or `{ "status": "error", "message": "..." }`.

---

## Project Structure

```
carryon/
|-- apps/
|   |-- api/
|   |   |-- src/
|   |   |   |-- config/          # Environment and app configuration
|   |   |   |-- controllers/
|   |   |   |   |-- ai/          # Chat, curiosity, wow controllers
|   |   |   |   |-- auth/        # Authentication controller
|   |   |   |   |-- history/     # Conversation history controller
|   |   |   |   |-- image/       # Image search controller
|   |   |   |   |-- journey/     # Journey persistence controller
|   |   |   |   +-- user/        # User profile controller
|   |   |   |-- middleware/      # Auth, error handling, rate limiting
|   |   |   |-- models/          # Data models
|   |   |   |-- routes/v1/       # Versioned API routes
|   |   |   |-- services/
|   |   |   |   |-- ai/          # Gemini provider, prompt builder, conversation manager
|   |   |   |   |-- image/       # Image search abstraction (Pexels)
|   |   |   |   +-- visual/      # Visual resolution (Mermaid, Wikipedia)
|   |   |   |-- utils/           # Logger, constants, error classes
|   |   |   |-- validators/      # Request validation
|   |   |   |-- app.js           # Express app setup
|   |   |   +-- server.js        # HTTP server entry point
|   |   +-- tests/               # API test suite
|   +-- web/
|       |-- src/
|       |   |-- components/
|       |   |   |-- AIJourney.jsx        # Main journey view with step navigation
|       |   |   |-- AuthPanel.jsx        # Supabase email auth modal
|       |   |   |-- CuriosityCapture.jsx # Text selection and image cropping
|       |   |   |-- EntryPhase.jsx       # Home screen with search input
|       |   |   |-- Fallback.jsx         # Fallback display for unmatched topics
|       |   |   |-- Journey.jsx          # Knowledge-tool-based journey view
|       |   |   |-- LoadingScreen.jsx    # Animated loading with progress bar
|       |   |   |-- MermaidVisual.jsx    # Mermaid diagram renderer
|       |   |   +-- WowReflection.jsx    # Wow score and reaction collection
|       |   |-- api.js           # Frontend API client
|       |   |-- supabase.js      # Supabase client initialization
|       |   |-- styles.css       # Full application stylesheet
|       |   |-- App.jsx          # Root component and screen routing
|       |   +-- main.jsx         # React DOM entry point
|       +-- index.html           # HTML shell
|-- packages/
|   |-- contracts/               # Shared payload shapes
|   |-- knowledge-tools/         # Human-authored topic manifests
|   +-- simulator-core/          # Deterministic algorithms (Round Robin)
|-- docs/
|   |-- architecture.md          # Ownership boundaries and modification rules
|   |-- api-contract.md          # Full API specification
|   +-- supabase-journey.sql     # Database schema and RLS policies
|-- render.yaml                  # Render deployment blueprint
|-- pnpm-workspace.yaml          # Monorepo workspace config
+-- package.json                 # Root scripts and shared dependencies
```

---

## Built with OpenAI Codex and GPT-5.6

This project was developed with significant assistance from **OpenAI Codex** (the autonomous coding agent) and the **GPT-5.6** model. Codex was used as a pair-programming partner throughout the development lifecycle, from initial project scaffolding and architecture design to feature implementation and debugging.

### How Codex and GPT-5.6 Were Used

**Project Scaffolding and Architecture**
Codex helped design the monorepo structure, establish ownership boundaries between frontend, backend, simulation, and content layers, and generate the initial Express.js backend infrastructure including the modular route/controller/service pattern.

**Curiosity Engine**
The Curiosity Engine -- the feature that lets learners select text or crop image regions mid-journey for a one-shot AI follow-up -- was built with Codex. This includes the pointer-based image region capture, canvas cropping logic, base64 encoding, and the multimodal Gemini API integration that processes both text selections and image data.

**Wow Calculator**
The Wow Calculator -- the reflection system where learners rate their understanding and select qualitative reactions, which the AI then uses to generate personalized next topics -- was built with Codex. This includes the two-stage reflection UI, the wow score computation, the structured JSON prompt for the reflection engine, and the adaptive learning path generation.

**AI Service Layer**
Codex assisted in building the provider-agnostic AI service architecture, including the Gemini provider with model fallback, exponential backoff retry logic, structured JSON response parsing, and the prompt builder system.

**Backend Infrastructure**
The transition from a monolithic HTTP server to a production-ready Express.js backend with Supabase authentication, rate limiting, CORS configuration, Helmet security headers, and structured logging was developed with Codex.

**Frontend Components**
Codex contributed to building the React component tree including the animated loading screen with particle effects and orbital animations, the step-based journey navigation, the Mermaid diagram renderer, and the auth panel.

### Codex Session IDs

The following Codex session IDs document the development history of this project:

- `019f8420-2833-7c63-86d9-5b75914d334a`
- `019f84ba-751e-7621-9e8b-51891d05c771`

These sessions can be referenced for a complete audit trail of the AI-assisted development process.

---

## Known Bugs and Caveats

> **CAUTION**: Please read these known issues before using or evaluating the application.

**Backend cold start delay**
The backend API is hosted on Render's free tier. Free-tier services spin down after periods of inactivity. When you first access the application or after it has been idle, the backend may take approximately 30 seconds to start responding. Wait for the initial connection to establish before interacting with the app. Subsequent requests will be fast until the service goes idle again.

**API rate limits**
The Gemini API has usage quotas on free-tier keys. If you encounter errors related to rate limiting or quota exhaustion, the daily limit has likely been reached. Wait approximately 24 hours for the quota to reset and try again.

**Mermaid diagram rendering failures**
The AI-generated Mermaid diagram syntax occasionally fails to parse or render correctly in the browser. If a diagram appears broken or does not render, reload the page. The underlying data is still valid; it is the client-side Mermaid parser that intermittently fails on certain syntax patterns.

**First-time sign-in requires email confirmation**
When signing up for the first time, Supabase sends a confirmation email to the address you provide. You must click the confirmation link in that email before you can log in. Check your spam or junk folder if the email does not appear in your inbox. After confirming, return to the application and log in with your credentials.

**Visual type fallback**
When Wikipedia image lookup fails (network issues, missing articles, or API errors), the system silently falls back to text-only mode for that step. The textual content is unaffected.

**Single curiosity check per session**
The Curiosity Engine is intentionally limited to one use per search session. This is a design decision, not a bug, but it can surprise first-time users who expect to ask multiple follow-up questions.

---

## License

This project is not currently published under a specific open-source license. All rights reserved.
