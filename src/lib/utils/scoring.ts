import type { AppState, DayCompletions } from '$lib/stores/state';

export const VERIFIED_WEIGHT = 1.0;
export const UNVERIFIED_WEIGHT = 0.5;

// ── Completion scoring ────────────────────────────────────────

export function dailyPoints(dayMap: DayCompletions, habitIds: string[]): number {
  return habitIds.reduce((sum, id) => {
    const entry = dayMap[id];
    if (!entry) return sum;
    return sum + (entry.verified ? VERIFIED_WEIGHT : UNVERIFIED_WEIGHT);
  }, 0);
}

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

// ── Reward formula ────────────────────────────────────────────

/**
 * Step multiplier for consecutive check-in streak.
 * Milestones at 7 / 14 / 21 days.
 */
export function streakMultiplier(streakDays: number): number {
  if (streakDays >= 21) return 1.6;
  if (streakDays >= 14) return 1.35;
  if (streakDays >= 7)  return 1.15;
  return 1.0;
}

/**
 * Ratio of verified completions across all days (0.0–1.0).
 */
export function getVerifiedRatio(
  completions: AppState['completions'],
  habitIds: string[]
): number {
  let total = 0;
  let verified = 0;
  Object.values(completions).forEach((dayMap) => {
    habitIds.forEach((id) => {
      if (dayMap[id]) {
        total++;
        if (dayMap[id].verified) verified++;
      }
    });
  });
  return total > 0 ? verified / total : 0;
}

/**
 * Composite weight for one participant.
 *
 * score_mult     = 0.5 + (scorePct / 100)   → 0.5× – 1.5×
 * streak_mult    = 1.0 / 1.15 / 1.35 / 1.6× (milestone steps)
 * verify_bonus   = 1.0 + (verifiedRatio × 0.25) → 1.0× – 1.25×
 *
 * Min weight (signed up, did nothing) : 0.5 × 1.0 × 1.0 = 0.50
 * Max weight (perfect + full streak)  : 1.5 × 1.6 × 1.25 = 3.00
 * Top vs bottom ratio: 6×
 */
export function computeUserWeight(
  scorePct: number,
  streakDays: number,
  verifiedRatio: number
): number {
  const scoreMult      = 0.5 + scorePct / 100;
  const strkMult       = streakMultiplier(streakDays);
  const verifyBonus    = 1.0 + verifiedRatio * 0.25;
  return scoreMult * strkMult * verifyBonus;
}

/**
 * CRC reward for a single participant given total weight across all participants.
 */
export function computeReward(
  userWeight: number,
  totalWeight: number,
  poolCRC: number
): number {
  if (totalWeight === 0 || poolCRC === 0) return 0;
  return (userWeight / totalWeight) * poolCRC;
}

// ── Helpers ───────────────────────────────────────────────────

export function heatLevel(pct: number): 'none' | 'low' | 'mid' | 'high' {
  if (pct === 0) return 'none';
  if (pct < 40) return 'low';
  if (pct < 80) return 'mid';
  return 'high';
}

export function shortAddr(addr: string | null): string {
  if (!addr) return '';
  return addr.length > 12 ? addr.slice(0, 6) + '…' + addr.slice(-4) : addr;
}

export function formatDateKey(key: string): string {
  const d = new Date(key + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
