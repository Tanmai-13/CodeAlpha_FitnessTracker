export type ActivityLog = {
  id: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  steps: number;
  waterMl: number;
  calories: number;
  activeMinutes: number;
};

export type Workout = {
  id: string;
  type: string;
  durationMin: number;
  date: string;
  notes: string;
  createdAt: number;
};

export type Goals = {
  steps: number;
  waterMl: number;
  calories: number;
  activeMinutes: number;
};

export type FitnessState = {
  logs: ActivityLog[];
  workouts: Workout[];
  goals: Goals;
};

export const WORKOUT_TYPES = [
  "Running",
  "Cycling",
  "Strength",
  "Yoga",
  "Swimming",
  "HIIT",
  "Walking",
  "Other",
] as const;

export const DEFAULT_GOALS: Goals = {
  steps: 10000,
  waterMl: 2500,
  calories: 600,
  activeMinutes: 45,
};
