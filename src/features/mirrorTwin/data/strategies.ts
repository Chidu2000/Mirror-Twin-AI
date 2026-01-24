export type EvolutionStage = 'Emerging' | 'Growing' | 'Thriving' | 'Radiant';

const CODING_STRATEGIES: Record<EvolutionStage, (topic: string) => string[]> = {
  Emerging: (topic) => [
    `Learn the core syntax basics of ${topic} (variables, functions, conditionals).`,
    `Write 10 lines of ${topic} code without AI or copy-paste.`,
    'Recreate a tiny program you already understand from scratch.',
    `Solve one beginner ${topic} exercise and explain it in your own words.`,
    'Set up your editor, formatter, and run a simple script end-to-end.',
  ],
  Growing: (topic) => [
    `Build a small ${topic} feature with input → process → output.`,
    'Debug errors across multiple files without AI, then compare results.',
    `Practice reading and modifying someone else’s ${topic} code.`,
    'Write 3 small functions and add quick tests for each.',
    `Track one metric (bugs fixed, exercises solved) for ${topic}.`,
  ],
  Thriving: (topic) => [
    `Refactor a ${topic} module to improve clarity and reduce repetition.`,
    'Solve a medium‑level problem and write down your approach.',
    'Design a reusable component or utility and document it.',
    `Review yesterday’s ${topic} work and remove one inefficiency.`,
    'Teach a concept you learned by writing a short explanation.',
  ],
  Radiant: (topic) => [
    `Ship a polished ${topic} mini‑project with clear README and tests.`,
    'Tackle a real bug or performance issue and measure the fix.',
    `Contribute a small improvement to an open‑source ${topic} repo.`,
    'Create a challenge for yourself and complete it end‑to‑end.',
    `Audit your ${topic} workflow and lock in your best 1% improvement.`,
  ],
};

const GENERAL_STRATEGIES: Record<EvolutionStage, (topic: string) => string[]> = {
  Emerging: (topic) => [
    `Learn the basic building blocks of ${topic}.`,
    `Practice the smallest core skill in ${topic} for 15–20 minutes.`,
    'Do one exercise without external help, then review your result.',
    `Write down the next step you can complete today for ${topic}.`,
    'Remove one friction point that blocks you from starting.',
  ],
  Growing: (topic) => [
    `Complete a focused session and track one measurable result in ${topic}.`,
    'Raise the difficulty slightly while keeping it winnable.',
    `Review and improve a previous ${topic} attempt.`,
    'Create a simple checklist for your next session.',
    'Share your plan or output with someone for accountability.',
  ],
  Thriving: (topic) => [
    `Refine your process in ${topic} by removing one wasteful step.`,
    'Add a stretch goal that builds momentum, not burnout.',
    `Teach back one concept from ${topic} in your own words.`,
    'Batch related tasks to keep focus high.',
    `Review progress and pick one lever to pull next in ${topic}.`,
  ],
  Radiant: (topic) => [
    `Ship a visible milestone in ${topic} and celebrate the win.`,
    'Optimize for consistency: same time, same place.',
    `Mentor or support someone who is one step behind you in ${topic}.`,
    'Design a challenge that keeps you in growth mode.',
    'Audit your routine and lock in the best 1 percent gain.',
  ],
};

function getResolutionTopic(resolution: string) {
  const cleaned = resolution.trim().replace(/^to\s+/i, '');
  return cleaned.length > 0 ? cleaned : 'your resolution';
}

function isCodingResolution(resolution: string) {
  return /code|coding|program|developer|software|engineer/i.test(resolution);
}

export function getStrategiesForResolution(resolution: string, stage: EvolutionStage | string) {
  const topic = getResolutionTopic(resolution);
  const bucket = isCodingResolution(resolution) ? CODING_STRATEGIES : GENERAL_STRATEGIES;
  if (stage in bucket) {
    return bucket[stage as EvolutionStage](topic).slice(0, 4);
  }
  return bucket.Emerging(topic).slice(0, 3);
}
