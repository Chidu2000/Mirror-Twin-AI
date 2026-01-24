# Mirror Twin

A daily self‑improvement companion that blends journaling, streak analytics, strategy prompts, and AI motivation to keep users consistent.

## Demo

Add a short demo video or GIF here.

## Features

- Guided setup for name, resolution, and struggles
- Daily journaling with a 5‑entry limit
- Streak and consistency dashboard widgets
- AI motivation summary + progress evaluation
- Strategy checklist tailored to evolution stage
- Chat with your “future self”

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Google Gemini API (via client calls)

## Getting Started

1. Install dependencies:
   - `npm install`
2. Create a `.env` from the example:
   - `cp .env.example .env`
3. Add your API keys to `.env`
4. Start the dev server:
   - `npm run dev`

## Environment Variables

- `VITE_GEMINI_API_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY` (if using Clerk)

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`

## Notes

If you plan to deploy, move API calls to a server to keep keys private.
