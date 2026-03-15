// ─────────────────────────────────────────────────────────────
// App state — Svelte stores with localStorage persistence
// Replaces the monolith's global `S` object
// ─────────────────────────────────────────────────────────────
import { writable, derived, get } from 'svelte/store';
import type { Habit } from '$lib/data/habits';

const STORAGE_KEY = 'hc_v5';

// ── Types ──────────────────────────────────────────────────
export type CompletionEntry = {
  verified: boolean;  // true = full point, false = 0.5 points
};

export type DayCompletions = Record<string, CompletionEntry>; // habitId → entry

export type AppState = {
  wallet: string | null;
  started: boolean;
  selected: string[];          // habit IDs
  customHabits: Habit[];       // user-created habits
  startDate: string | null;    // 'YYYY-MM-DD'
  completions: Record<string, DayCompletions>; // date → habitId → entry
  checkedIn: Record<string, boolean>;           // date → true
  leaderboard: LeaderboardEntry[];
};

export type LeaderboardEntry = {
  addr: string;
  pct: number;
  avatarColor: string;
  isMe?: boolean;
};

// ── Default state ──────────────────────────────────────────
const DEFAULT_STATE: AppState = {
  wallet: null,
  started: false,
  selected: [],
  customHabits: [],
  startDate: null,
  completions: {},
  checkedIn: {},
  leaderboard: []
};

// ── Load from localStorage ─────────────────────────────────
function loadState(): AppState {
  if (typeof localStorage === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

// ── Store ──────────────────────────────────────────────────
export const appState = writable<AppState>(loadState());

// Persist any state change to localStorage
appState.subscribe((value) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — fail silently
  }
});

// ── Convenience updaters ───────────────────────────────────
export function updateState(patch: Partial<AppState>) {
  appState.update((s) => ({ ...s, ...patch }));
}

export function setWallet(address: string | null) {
  appState.update((s) => ({ ...s, wallet: address }));
}

export function selectHabit(id: string) {
  appState.update((s) => {
    if (s.selected.includes(id) || s.selected.length >= 10) return s;
    return { ...s, selected: [...s.selected, id] };
  });
}

export function deselectHabit(id: string) {
  appState.update((s) => ({ ...s, selected: s.selected.filter((h) => h !== id) }));
}

export function addCustomHabit(habit: Habit) {
  appState.update((s) => ({
    ...s,
    customHabits: [...s.customHabits, habit],
    selected: [...s.selected, habit.id]
  }));
}

export function startChallenge() {
  appState.update((s) => ({
    ...s,
    started: true,
    startDate: new Date().toISOString().split('T')[0],
    completions: {},
    checkedIn: {}
  }));
}

export function recordCompletion(date: string, habitId: string, verified: boolean) {
  appState.update((s) => {
    const dayMap = { ...(s.completions[date] ?? {}) };
    dayMap[habitId] = { verified };
    return { ...s, completions: { ...s.completions, [date]: dayMap } };
  });
}

export function removeCompletion(date: string, habitId: string) {
  appState.update((s) => {
    const dayMap = { ...(s.completions[date] ?? {}) };
    delete dayMap[habitId];
    return { ...s, completions: { ...s.completions, [date]: dayMap } };
  });
}

export function recordCheckIn(date: string) {
  appState.update((s) => ({ ...s, checkedIn: { ...s.checkedIn, [date]: true } }));
}

// ── Derived values ─────────────────────────────────────────

/** Challenge day number (1–21), clamped */
export const challengeDay = derived(appState, ($s) => {
  if (!$s.startDate) return 1;
  const diff = Math.floor((Date.now() - new Date($s.startDate).getTime()) / 86_400_000) + 1;
  return Math.min(Math.max(diff, 1), 21);
});

/** Today's date key */
export function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/** Offset date key */
export function dateKey(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

/** Weighted score across all days (verified = 1.0, unverified = 0.5) */
export const overallScore = derived(appState, ($s) => {
  const dayN = get(challengeDay);
  if (!$s.selected.length) return 0;
  const totalPossible = dayN * $s.selected.length;
  let earned = 0;
  Object.values($s.completions).forEach((dayMap) => {
    $s.selected.forEach((id) => {
      const entry = dayMap[id];
      if (entry) earned += entry.verified ? 1.0 : 0.5;
    });
  });
  return totalPossible > 0 ? Math.round((earned / totalPossible) * 100) : 0;
});

/** Current streak (consecutive check-in days) */
export const currentStreak = derived(appState, ($s) => {
  const dayN = get(challengeDay);
  let streak = 0;
  for (let i = 0; i < dayN; i++) {
    if ($s.checkedIn[dateKey(-i)]) streak++;
    else break;
  }
  return streak;
});
