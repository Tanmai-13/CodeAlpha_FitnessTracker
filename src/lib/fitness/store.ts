import { useSyncExternalStore } from "react";
import { DEFAULT_GOALS, type ActivityLog, type FitnessState, type Goals, type Workout } from "./types";
import { addDays, todayISO } from "./date";

const STORAGE_KEY = "codealpha-fitness-tracker-v1";

const EMPTY: FitnessState = { logs: [], workouts: [], goals: DEFAULT_GOALS };

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function buildDemoState(): FitnessState {
  const today = todayISO();
  const stepsSeed = [8200, 11400, 6400, 12800, 9100, 13500, 5400];
  const waterSeed = [2000, 2600, 1500, 2800, 2200, 3000, 1200];
  const calSeed = [420, 700, 310, 820, 560, 910, 240];
  const minSeed = [35, 60, 20, 70, 45, 80, 18];

  const logs: ActivityLog[] = stepsSeed.map((steps, i) => ({
    id: uid(),
    date: addDays(today, i - 6),
    steps,
    waterMl: waterSeed[i]!,
    calories: calSeed[i]!,
    activeMinutes: minSeed[i]!,
  }));

  const workoutSeed: Array<[string, number, number, string]> = [
    ["Running", 32, 0, "Easy 5K around the park, steady pace."],
    ["Strength", 55, 1, "Push day — bench, overhead press, dips."],
    ["Yoga", 25, 2, "Mobility flow, focused on hips."],
    ["HIIT", 20, 4, "8 rounds of 40/20 intervals."],
    ["Cycling", 65, 5, "Long ride, rolling hills."],
  ];

  const workouts: Workout[] = workoutSeed.map(([type, durationMin, ago, notes], i) => ({
    id: uid(),
    type,
    durationMin,
    date: addDays(today, -ago),
    notes,
    createdAt: Date.now() - i * 1000,
  }));

  return { logs, workouts, goals: DEFAULT_GOALS };
}

let state: FitnessState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FitnessState>;
      state = {
        logs: parsed.logs ?? [],
        workouts: parsed.workouts ?? [],
        goals: { ...DEFAULT_GOALS, ...(parsed.goals ?? {}) },
      };
    } else {
      state = buildDemoState();
      persist();
    }
  } catch {
    state = buildDemoState();
  }
  emit();
}

function setState(next: FitnessState) {
  state = next;
  persist();
  emit();
}

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFitnessState(): FitnessState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );
}

export const actions = {
  /** Adds the given amounts onto the log for that date (creating it if needed). */
  addActivity(date: string, delta: Partial<Omit<ActivityLog, "id" | "date">>) {
    const existing = state.logs.find((l) => l.date === date);
    if (existing) {
      const updated: ActivityLog = {
        ...existing,
        steps: Math.max(0, existing.steps + (delta.steps ?? 0)),
        waterMl: Math.max(0, existing.waterMl + (delta.waterMl ?? 0)),
        calories: Math.max(0, existing.calories + (delta.calories ?? 0)),
        activeMinutes: Math.max(0, existing.activeMinutes + (delta.activeMinutes ?? 0)),
      };
      setState({ ...state, logs: state.logs.map((l) => (l.id === existing.id ? updated : l)) });
    } else {
      const created: ActivityLog = {
        id: uid(),
        date,
        steps: Math.max(0, delta.steps ?? 0),
        waterMl: Math.max(0, delta.waterMl ?? 0),
        calories: Math.max(0, delta.calories ?? 0),
        activeMinutes: Math.max(0, delta.activeMinutes ?? 0),
      };
      setState({ ...state, logs: [...state.logs, created] });
    }
  },

  addWorkout(input: Omit<Workout, "id" | "createdAt">) {
    const workout: Workout = { ...input, id: uid(), createdAt: Date.now() };
    setState({ ...state, workouts: [workout, ...state.workouts] });
  },

  updateWorkout(id: string, input: Omit<Workout, "id" | "createdAt">) {
    setState({
      ...state,
      workouts: state.workouts.map((w) => (w.id === id ? { ...w, ...input } : w)),
    });
  },

  deleteWorkout(id: string) {
    setState({ ...state, workouts: state.workouts.filter((w) => w.id !== id) });
  },

  setGoals(goals: Goals) {
    setState({ ...state, goals });
  },

  loadDemoData() {
    setState(buildDemoState());
  },

  clearAll() {
    setState({ logs: [], workouts: [], goals: state.goals });
  },
};

export function emptyLog(date: string): ActivityLog {
  return { id: "none", date, steps: 0, waterMl: 0, calories: 0, activeMinutes: 0 };
}
