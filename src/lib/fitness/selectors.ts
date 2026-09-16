import type { WeeklyPoint } from "@/components/fitness/weekly-chart";
import { lastSevenDays, shortLabel } from "./date";
import type { ActivityLog } from "./types";

export function logFor(logs: ActivityLog[], date: string): ActivityLog {
  return (
    logs.find((l) => l.date === date) ?? {
      id: `empty-${date}`,
      date,
      steps: 0,
      waterMl: 0,
      calories: 0,
      activeMinutes: 0,
    }
  );
}

export function weeklyPoints(logs: ActivityLog[]): WeeklyPoint[] {
  return lastSevenDays().map((date) => {
    const l = logFor(logs, date);
    return {
      date,
      label: shortLabel(date),
      steps: l.steps,
      waterMl: l.waterMl,
      calories: l.calories,
      activeMinutes: l.activeMinutes,
    };
  });
}

export function pct(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return (value / goal) * 100;
}
