/**
 * Calculates the ICE score: (impact * confidence * ease) / 10
 * Returns 0 if any value is null.
 */
export function calculateIceScore(
  impact: number | null,
  confidence: number | null,
  ease: number | null,
): number {
  if (impact === null || confidence === null || ease === null) return 0;
  return (impact * confidence * ease) / 10;
}

export type IceBadgeColor =
  | 'text-ice-80-100'
  | 'text-ice-60-79'
  | 'text-ice-40-59'
  | 'text-ice-20-39'
  | 'text-ice-0-19';

/**
 * Returns the Tailwind text-color class corresponding to the ICE score range
 * defined in index.css @theme tokens.
 */
export function getIceBadgeColor(score: number): IceBadgeColor {
  if (score >= 80) return 'text-ice-80-100';
  if (score >= 60) return 'text-ice-60-79';
  if (score >= 40) return 'text-ice-40-59';
  if (score >= 20) return 'text-ice-20-39';
  return 'text-ice-0-19';
}
