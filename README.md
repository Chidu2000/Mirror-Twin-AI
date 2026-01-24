# Mirror Twin

A daily self‑improvement companion that blends journaling, streak analytics, strategy prompts, and AI motivation to keep users consistent.

## Demo

Add a short demo video or GIF here.

## Features

- Guided setup for name, resolution, and struggles
- Daily journaling with a 5‑entry limit
- Streak and consistency dashboard widgets
- AI agent orchestration for daily motivation + progress evaluation
- Strategy checklist tailored to evolution stage
- Chat with your “future self”

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- AI agents powered by Google Gemini
  - Daily motivation agent
  - Progress evaluation agent
  - Strategy observer + strategist

## Getting Started

1. Install dependencies:
   - `bun install`
2. Create a `.env` from the example:
   - `cp .env.example .env`
3. Add your API keys to `.env`
4. Start the dev server:
   - `bun run dev`

## Environment Variables

- `VITE_GEMINI_API_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY` (if using Clerk)

## Scripts

- `bun run dev`
- `bun run build`
- `bun run preview`

## AI Agent Architecture

Mirror Twin is built around a small multi‑agent workflow that runs daily:

- **Observer agent**: analyzes recent journal entries and patterns
- **Strategy agent**: recommends tactical actions for the current evolution stage
- **Motivation agent**: generates a personalized daily motivation summary
- **Progress evaluator**: scores daily progress from entries (0–7)
