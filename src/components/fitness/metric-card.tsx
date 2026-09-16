import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  unit?: string;
  goalLabel?: string;
  percent: number;
  icon: LucideIcon;
  tone: "steps" | "water" | "calories" | "minutes";
};

const toneMap = {
  steps: { text: "text-steps", bar: "bg-steps", ring: "shadow-[0_0_0_1px_var(--steps)]" },
  water: { text: "text-water", bar: "bg-water", ring: "shadow-[0_0_0_1px_var(--water)]" },
  calories: { text: "text-calories", bar: "bg-calories", ring: "shadow-[0_0_0_1px_var(--calories)]" },
  minutes: { text: "text-minutes", bar: "bg-minutes", ring: "shadow-[0_0_0_1px_var(--minutes)]" },
} as const;

export function MetricCard({ label, value, unit, goalLabel, percent, icon: Icon, tone }: Props) {
  const t = toneMap[tone];
  const pct = Math.min(100, Math.round(percent));

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card/70 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">
            {value}
            {unit ? <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span> : null}
          </p>
        </div>
        <span
          className={cn(
            "grid size-10 place-items-center rounded-xl bg-secondary/80 transition-transform duration-300 group-hover:scale-110",
            t.text,
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full rounded-full transition-[width] duration-700 ease-out", t.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{goalLabel}</span>
          <span className={cn("font-semibold tabular-nums", pct >= 100 ? t.text : "")}>{pct}%</span>
        </div>
      </div>
    </Card>
  );
}
