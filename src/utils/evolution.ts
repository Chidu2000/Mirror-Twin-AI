export function getTwinEvolution(progressLevel: number) {
  if (progressLevel < 20) return { stage: 'Emerging', color: 'from-gray-400 to-gray-500', glow: 'shadow-gray-500/20' };
  if (progressLevel < 50) return { stage: 'Growing', color: 'from-blue-400 to-blue-500', glow: 'shadow-blue-500/30' };
  if (progressLevel < 80) return { stage: 'Thriving', color: 'from-purple-400 to-purple-500', glow: 'shadow-purple-500/40' };
  return { stage: 'Radiant', color: 'from-yellow-400 to-amber-500', glow: 'shadow-amber-500/50' };
}
