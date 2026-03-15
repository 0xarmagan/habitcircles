// ─────────────────────────────────────────────────────────────
// Scoring utilities
// Isolated so they can be unit-tested independently of Svelte.
// Also used by the Week 5 backend (same formula, same file).
// ─────────────────────────────────────────────────────────────
import type { AppState, DayCompletions } from '$lib/stores/state';

export const VERIFIED_WEIGHT = 1.0;
export const UNVERIFIED_WEIGHT = 0.5;

/**
 * Points earned from a single day's completions for a given set of habit IDs.
 */
export function dailyPoints(dayMap: DayCompletions, habitIds: string[]): number {
  return habitIds.reduce((sum, id) => {
    const entry = dayMap[id];
    if (!entry) return sum;
    return sum + (entry.verified ? VERIFIED_WEIGHT : UNVERIFIED_WEIGHT);
  }, 0);
}

/**
 * Total weighted score as a percentage (0–100).
 * totalPossible = dayNumber × numberOfHabits
 */
export function computeScore(
  completions: AppState['completions'],
  habitIds: string[],
  dayNumber: number
): number {
  const totalPossible = dayNumber * habitIds.length;
  if (totalPossible === 0) return 0;

  let earned = 0;
  Object.values(completions).forEach((dayMap) => {
    earned += dailyPoints(dayMap, habitIds);
  });

  return Math.round((earned / totalPossible) * 100);
}

/**
 * Per-habit breakdown: points earned, days completed, verified/unverified split.
 */
export function habitBreakdown(
  completions: AppState['completions'],
  habitId: string,
  dayNumber: number
) {
  const days = Object.values(completions).filter((d) => d[habitId]);
  const verified = days.filter((d) => d[habitId].verified).length;
  const unverified = days.length - verified;
  const points = verified * VERIFIED_WEIGHT + unverified * UNVERIFIED_WEIGHT;
  const pct = dayNumber > 0 ? Math.round((points / dayNumber) * 100) : 0;

  return { days: days.length, verified, unverified, points, pct };
}

/**
 * Heatmap intensity level for a given day.
 */
export function heatLevel(pct: number): 'none' | 'low' | 'mid' | 'high' {
  if (pct === 0) return 'none';
  if (pct < 40) return 'low';
  if (pct < 80) return 'mid';
  return 'high';
}

/**
 * Format wallet address for display.
 */
export function shortAddr(addr: string | null): string {
  if (!addr) return '';
  return addr.length > 12 ? addr.slice(0, 6) + '…' + addr.slice(-4) : addr;
}

/**
 * Format a date key to a readable label.
 */
export function formatDateKey(key: string): string {
  const d = new Date(key + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
