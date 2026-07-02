
# Omnipost

Omnipost is an AI-powered social media content generator. Give it a single idea and it drafts platform-tailored posts — text and matching images — for **LinkedIn**, **Twitter/X**, and **Instagram** all at once.

## Features

- **One idea, three posts** — enter a topic (optionally with an image or other media attached) and get:
  - A long-form, professional post for **LinkedIn**
  - A punchy, sub-280-character post for **Twitter/X**
  - A visual, hashtag-friendly caption for **Instagram**
- **AI image generation** — each post is paired with a matching image, auto-sized per platform (16:9 for LinkedIn/Twitter, 1:1 for Instagram), with configurable resolution and aspect ratio.
- **Per-platform regeneration** — not happy with one post? Regenerate just that platform without redoing the others.
- **Tone control** — pick the tone (e.g. professional, casual) applied across all generated posts.
- **AI brainstorm chatbot** — a built-in assistant with Google Search grounding to help you shape ideas and pull in current trends before generating.
- **Google Sign-In & history** — sign in with Google to save generated posts to Firestore and revisit them later.
- **Copy-to-clipboard** — grab any generated post's text with one click.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Backend | Express (served via Vite middleware in dev / static build in prod) |
| AI | Google Gemini API (`@google/genai`) — text via `gemini-3.5-flash`, images via `gemini-3.1-flash-image-preview` |
| Auth & Storage | Firebase Authentication (Google Sign-In), Firestore |
| Optional | Firebase Cloud Functions (scaffolded, not yet wired into the app) |

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- A [Gemini API key](https://aistudio.google.com/apikey)
- A Firebase project (for auth/history features)

### Installation

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"
```

For Firebase, set the corresponding `VITE_FIREBASE_*` variables (API key, auth domain, project ID, storage bucket, messaging sender ID, app ID) — see `src/lib/firebase.ts` for the full list of keys expected.

> ⚠️ **Never commit your `.env` file or real API keys.** `.env*` is already gitignored (except `.env.example`).

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for production

```bash
npm run build
npm start
```

## Project Structure

```
omnipost/
├── server.ts                  # Express server + Gemini API routes (/api/generate, /api/regenerate, /api/chat)
├── src/
│   ├── App.tsx                 # Main UI — idea input, generated post cards, history tab
│   ├── components/
│   │   └── ChatbotWidget.tsx   # AI brainstorming chat sidebar
│   ├── contexts/
│   │   └── AuthContext.tsx     # Firebase auth context (Google Sign-In)
│   ├── lib/
│   │   └── firebase.ts         # Firebase app initialization
│   └── dataconnect-generated/  # Generated Firebase Data Connect SDK
├── functions/                  # Firebase Cloud Functions (scaffolded)
└── dataconnect/                # Firebase Data Connect schema & connectors
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/generate` | Generate LinkedIn, Twitter, and Instagram posts (text + image) from an idea |
| POST | `/api/regenerate` | Regenerate the post for a single platform |
| POST | `/api/chat` | Chat with the AI brainstorming assistant (Google Search-grounded) |

## License

Private project — license not yet specified.
