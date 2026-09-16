import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Droplets, Flame, Footprints, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, useFitnessState } from "@/lib/fitness/store";
import { logFor } from "@/lib/fitness/selectors";
import { todayISO } from "@/lib/fitness/date";

export const Route = createFileRoute("/log")({
  head: () => ({
    meta: [
      { title: "Log Activity — PulseTrack Fitness Tracker" },
      {
        name: "description",
        content: "Record steps, water intake, calories burned and active minutes for any day.",
      },
      { property: "og:title", content: "Log Activity — PulseTrack Fitness Tracker" },
      {
        property: "og:description",
        content: "A validated daily activity form with quick increment buttons.",
      },
    ],
  }),
  component: LogPage,
});

type FieldKey = "steps" | "waterMl" | "calories" | "activeMinutes";

const FIELDS: Array<{
  key: FieldKey;
  label: string;
  unit: string;
  max: number;
  icon: typeof Footprints;
  quick: number[];
}> = [
  { key: "steps", label: "Steps", unit: "steps", max: 100000, icon: Footprints, quick: [500, 1000, 2500] },
  { key: "waterMl", label: "Water intake", unit: "ml", max: 10000, icon: Droplets, quick: [250, 500, 750] },
  { key: "calories", label: "Calories burned", unit: "kcal", max: 10000, icon: Flame, quick: [50, 100, 250] },
  { key: "activeMinutes", label: "Active duration", unit: "min", max: 1440, icon: Timer, quick: [10, 20, 30] },
];

function LogPage() {
  const { logs } = useFitnessState();
  const [date, setDate] = useState(todayISO());
  const [values, setValues] = useState<Record<FieldKey, string>>({
    steps: "",
    waterMl: "",
    calories: "",
    activeMinutes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey | "form", string>>>({});

  const existing = logFor(logs, date);

  function bump(key: FieldKey, amount: number) {
    setValues((v) => {
      const current = Number(v[key] || 0);
      const next = Number.isFinite(current) ? current + amount : amount;
      return { ...v, [key]: String(next) };
    });
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Partial<Record<FieldKey | "form", string>> = {};
    const delta: Partial<Record<FieldKey, number>> = {};
    let total = 0;

    for (const f of FIELDS) {
      const raw = values[f.key].trim();
      if (!raw) continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
        nextErrors[f.key] = "Enter a whole number of 0 or more";
      } else if (n > f.max) {
        nextErrors[f.key] = `That looks too high — keep it under ${f.max.toLocaleString()} ${f.unit}`;
      } else {
        delta[f.key] = n;
        total += n;
      }
    }

    if (!date) nextErrors.form = "Pick a date for this entry";
    else if (date > todayISO()) nextErrors.form = "You can't log activity for a future date";
    else if (total === 0 && !Object.keys(nextErrors).length) nextErrors.form = "Add at least one value to save";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    actions.addActivity(date, delta);
    setValues({ steps: "", waterMl: "", calories: "", activeMinutes: "" });
    toast.success("Activity added to your day");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold sm:text-4xl">Log daily activity</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Values are added on top of what you already recorded for the selected day.
      </p>

      <Card className="mt-6 border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle className="text-base">New entry</CardTitle>
          <CardDescription>
            Currently recorded on {date || "—"}: {existing.steps.toLocaleString()} steps ·{" "}
            {existing.waterMl.toLocaleString()} ml · {existing.calories.toLocaleString()} kcal ·{" "}
            {existing.activeMinutes} min
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} noValidate className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                max={todayISO()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="sm:max-w-xs"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label htmlFor={f.key} className="flex items-center gap-2">
                    <f.icon className="size-4 text-muted-foreground" />
                    {f.label} <span className="text-muted-foreground">({f.unit})</span>
                  </Label>
                  <Input
                    id={f.key}
                    inputMode="numeric"
                    placeholder="0"
                    value={values[f.key]}
                    aria-invalid={Boolean(errors[f.key])}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, [f.key]: e.target.value }));
                      setErrors((er) => ({ ...er, [f.key]: undefined, form: undefined }));
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {f.quick.map((q) => (
                      <Button
                        key={q}
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-7 rounded-full px-3 text-xs transition-transform active:scale-95"
                        onClick={() => bump(f.key, q)}
                      >
                        +{q.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                  {errors[f.key] ? <p className="text-xs text-destructive">{errors[f.key]}</p> : null}
                </div>
              ))}
            </div>

            {errors.form ? (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors.form}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit">Save entry</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setValues({ steps: "", waterMl: "", calories: "", activeMinutes: "" });
                  setErrors({});
                }}
              >
                Clear form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
