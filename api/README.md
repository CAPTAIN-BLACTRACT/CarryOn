# CarryOn API

Production-ready Express backend for the CarryOn AI learning platform.

## Architecture

```
apps/api/
├── src/
│   ├── config/              # Environment, Supabase client
│   │   ├── env.js           # Centralized env validation
│   │   └── supabase.js      # Lazy Supabase client factory
│   ├── controllers/         # Route handlers (thin, delegate to services)
│   │   ├── ai/              # POST /chat, /generate
│   │   ├── auth/            # POST /login, /logout, GET /me
│   │   ├── history/         # GET/DELETE /history
│   │   ├── image/           # GET /images/search, POST /images/download
│   │   └── user/            # GET/PUT /profile
│   ├── middleware/           # Express middleware
│   │   ├── auth.js          # JWT verification (Supabase)
│   │   ├── errorHandler.js  # Centralized error handling + 404
│   │   ├── rateLimiter.js   # Global, AI, and auth rate limiters
│   │   └── index.js
│   ├── models/              # Database helpers (Supabase queries)
│   │   └── index.js         # Users, profiles, conversations, messages
│   ├── routes/v1/           # Versioned API routes
│   ├── services/
│   │   ├── ai/              # AI provider abstraction
│   │   │   ├── provider.interface.js   # Base class contract
│   │   │   ├── gemini.service.js       # Google Gemini implementation
│   │   │   ├── prompt.builder.js       # Prompt templates
│   │   │   └── conversation.manager.js # History management
│   │   └── image/           # Image search abstraction
│   │       ├── image.service.js        # Search facade
│   │       ├── download.service.js     # Download + cache
│   │       └── image.providers/        # Pexels, Pixabay, etc.
│   ├── utils/
│   │   ├── errors.js        # Custom error classes
│   │   ├── logger.js        # Dev/prod logger
│   │   ├── constants/       # HTTP codes, limits, provider names
│   │   └── helpers/         # asyncHandler, response builder
│   ├── validators/          # Input validation
│   ├── app.js               # Express app configuration
│   └── server.js            # Entry point
├── uploads/                 # Downloaded images (gitignored in prod)
├── logs/                    # Application logs
├── tests/                   # Test files
├── .env.example             # Environment variable template
└── package.json
```

## Quick Start

### 1. Install dependencies

```bash
cd apps/api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual keys
```

### 3. Run locally

```bash
# From project root (starts both API + frontend)
npm run dev

# Or API only
cd apps/api && node --watch src/server.js
```

The API starts on `http://localhost:3000`.
The frontend (Vite) proxies `/api` requests to this port automatically.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | `development` or `production` |
| `SUPABASE_URL` | Prod | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Prod | Supabase public key |
| `SUPABASE_SECRET_KEY` | Prod | Supabase server-only secret key |
| `SUPABASE_JWT_SECRET` | No | JWT secret for manual verification |
| `GEMINI_API_KEY` | Prod | Google Gemini API key |
| `GEMINI_MODEL` | No | Primary Gemini model (default: `gemini-3.5-flash`) |
| `GEMINI_FALLBACK_MODEL` | No | Fallback Gemini model (default: `gemini-3.1-flash-lite`) |
| `IMAGE_PROVIDER` | No | `pexels` or `pixabay` (default: pexels) |
| `IMAGE_API_KEY` | No | API key for image provider |
| `FRONTEND_URL` | Prod | Frontend URL for CORS whitelist |
| `LOG_LEVEL` | No | `error`, `warn`, `info`, `debug` |

> In development, the server starts without Supabase/Gemini keys (with warnings).
> In production, missing required keys cause a hard failure at startup.

## API Endpoints

All endpoints return a consistent envelope:

```json
{ "success": true, "message": "...", "data": {}, "error": null }
```

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Server health check |

### Auth (protected)

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Server-side login (upsert user) |
| POST | `/api/v1/auth/logout` | Server-side logout |
| GET | `/api/v1/auth/me` | Get current user |

### AI (protected + rate limited)

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/ai/chat` | Conversational chat |
| POST | `/api/v1/ai/generate` | One-shot generation |

### History (protected)

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/history` | List conversations |
| GET | `/api/v1/history/:id` | Get conversation + messages |
| DELETE | `/api/v1/history/:id` | Delete conversation |

### User (protected)

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/user/profile` | Get profile |
| PUT | `/api/v1/user/profile` | Update profile |

### Images (protected)

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/images/search` | Search images |
| POST | `/api/v1/images/download` | Download + cache image |

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the **Project URL**, **anon key**, and **service role key** from Settings → API
3. Paste into your `.env`
4. Create these tables in the SQL editor:

The journey table used by the protected search flow is defined in [`docs/supabase-journey.sql`](../../docs/supabase-journey.sql). Run that migration once in the Supabase SQL editor. Its JSONB `curiosity_scores` and `metadata` fields are intentionally extensible.

```sql
-- Users (synced from Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New conversation',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Image cache
CREATE TABLE image_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT UNIQUE NOT NULL,
  provider TEXT,
  url TEXT,
  local_path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Preferences
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  settings JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Connecting Gemini

1. Get a free API key at [aistudio.google.com](https://aistudio.google.com)
2. Set `GEMINI_API_KEY` in your `.env`
3. The default model is `gemini-3.5-flash` (override with `GEMINI_MODEL`)

### Swapping AI Providers

The AI layer is provider-agnostic. To add a new provider:

1. Create `services/ai/openai.service.js` extending `AIProvider`
2. Implement `generateText()`, `chat()`, `chatStream()`
3. Update the import in controllers

## Deploying to Render

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Build command**: `cd apps/api && npm install`
   - **Start command**: `cd apps/api && npm start`
   - **Health check path**: `/health`
4. Add all environment variables from `.env.example`
5. Or use the included `render.yaml` for Infrastructure as Code

## Security

- **Helmet** — Sets security headers
- **CORS** — Whitelisted origins in production
- **Rate limiting** — Global (100/15min), AI (15/min), Auth (20/15min)
- **JWT verification** — All protected routes verify Supabase JWTs
- **Input validation** — Request bodies validated before processing
- **Request size limits** — 1MB max body size
- **No exposed secrets** — All API keys stay server-side

## Future Extension Points

The architecture is designed to accommodate:

- WebSocket support (add `ws` alongside Express)
- Streaming responses (chatStream is already in the provider interface)
- Redis caching (add as a service)
- File uploads (multer middleware + upload service)
- Payment processing (new controller + service)
- Admin dashboard (new route group + role middleware)
- Vector databases (new service under services/)
- Queue processing (Bull/BullMQ service)
- Multiple AI providers (extend AIProvider base class)
- Analytics (middleware + service)
