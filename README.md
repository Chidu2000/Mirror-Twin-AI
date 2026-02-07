# Mirror Twin

Mirror Twin is a daily accountability companion that speaks as your future self.  
You log quick entries, and the app responds with grounded motivation tailored to your goal.  
It tracks real effort over perfection, so progress feels fair and sustainable.  
Stage-based strategies keep the next step clear and small.  
The result is a light, repeatable loop that builds momentum without guilt.  
Designed for privacy and safety, it keeps outputs helpful and concise.  

## Links
1. Live demo: `https://mirror-twin-eight.vercel.app`
2. Video walkthrough: `ADD_VIDEO_URL`
3. Pitch deck: `ADD_PITCH_DECK_URL`

## Tech Stack
- React + Node.js + TypeScript + Vite
- Tailwind CSS
- Google Gemini (generation + evaluation) powered AI agents
- Opik (tracing + evals)

## Architecture Diagram
![Mirror Twin Architecture](./public/architecture.png)

## Agent Deep Dive
- **Orchestrator**: Coordinates daily runs, routes inputs to the right agents, and aggregates outputs.
- **Motivation Agent**: Generates a short, grounded motivation message tailored to the user’s stage.
- **Progress Evaluator**: Scores daily effort (0–7) from journal entries and provides a brief reason.
- **Strategy Agent**: Suggests small, actionable steps aligned with the current evolution stage.
- **Chat Twin**: Replies as the future self, using recent context to keep the user on track.

## Opik Observability
Mirror Twin logs each agent run as a trace with spans for LLM calls.  
LLM-as-judge scoring tracks relevance and usefulness across:
- Motivation output
- Chat twin replies
- Progress evaluations  
This makes it easy to detect drift, compare prompt versions, and improve quality.

## Getting Started
1. Install dependencies:
   - `bun install`
2. Create a `.env`:
   - `cp .env.example .env`
3. Set environment variables:
   - `VITE_GEMINI_API_KEY`
   - `VITE_CLERK_PUBLISHABLE_KEY` (optional)
   - `VITE_OPIK_API_KEY`
   - `VITE_OPIK_PROJECT_NAME`
4. Run the app:
   - `bun run dev`
