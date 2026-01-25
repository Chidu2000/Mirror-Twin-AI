# Mirror Twin

A daily self‑improvement companion that blends journaling, streak analytics, strategy prompts, and AI motivation to keep users consistent.

## Demo

Add a short demo video or GIF here.

## Features

- Guided setup for name, resolution, and struggles
- Daily journaling with a 5‑entry limit
- Streak and consistency dashboard widgets
- AI agent orchestration for daily motivation + progress evaluation
- Opik observability with traces, spans, and LLM‑as‑judge evaluations
- Strategy checklist tailored to evolution stage
- Chat with your “future self”

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- AI agents powered by Google Gemini
  - Daily motivation agent
  - Progress evaluation agent
  - Strategy observer + strategist
- Opik for tracing, evaluation, and experiment tracking

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
- `VITE_OPIK_API_KEY`
- `VITE_OPIK_PROJECT_NAME`
- `VITE_OPIK_WORKSPACE_NAME`
- `VITE_OPIK_URL_OVERRIDE`
- `VITE_OPIK_EVALS_ENABLED` (set `true` to enable LLM‑as‑judge scoring)
- `VITE_OPIK_EVAL_MODEL` (optional, defaults to Opik metric defaults)

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

## Evaluation & Observability (Opik)

Mirror Twin logs agent runs to Opik with traces + spans and evaluates output quality with LLM‑as‑judge metrics:

- Motivation: relevance + usefulness
- Chat twin responses: relevance + usefulness
- Progress evaluation: relevance + usefulness

These scores are recorded as feedback on each trace to track quality over time and compare prompt/model changes.

### Hackathon Criteria Alignment

- **Functionality**: core loop works end‑to‑end (setup → journal → progress → chat → strategies).
- **Real‑world relevance**: focuses on consistent daily habits and New Year’s goals.
- **LLMs/Agents**: daily agent orchestration + LLM‑driven motivation, evaluation, and coaching.
- **Evaluation & observability**: Opik traces, spans, and LLM‑as‑judge metrics logged per agent run.
- **Goal alignment**: prompt versions and run metadata are tagged to compare experiments over time.

### Opik Workflow (for judges)

1. Start Opik ingest server: `bun run dev:opik`
2. Start the app: `bun run dev`
3. Use the app (log entries, run progress, chat)
4. Open Opik and filter by `metadata.runId` or agent names:
   - `agent.motivation`
   - `agent.progress_evaluator`
   - `agent.chat_twin`
   - `agent.orchestrator`

### Experiment Tracking

Prompt and agent versions are tagged in trace metadata (`promptVersion`, `orchestratorVersion`).  
To compare changes, update these version strings and run again—Opik will show side‑by‑side metrics.
