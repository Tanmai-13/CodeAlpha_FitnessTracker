import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WeeklyChart } from "@/components/fitness/weekly-chart";
import { DataControls } from "@/components/fitness/data-controls";
import { useFitnessState } from "@/lib/fitness/store";
import { pct, weeklyPoints } from "@/lib/fitness/selectors";
import { prettyDate } from "@/lib/fitness/date";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — PulseTrack Fitness Tracker" },
      {
        name: "description",
        content: "Weekly and daily progress charts plus goal-completion breakdown for every tracked metric.",
      },
      { property: "og:title", content: "Progress — PulseTrack Fitness Tracker" },
      { property: "og:description", content: "Charts and stats showing how your week measured up to your goals." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { logs, goals, workouts } = useFitnessState();
  const week = weeklyPoints(logs);

  const totals = week.reduce(
    (acc, d) => ({
      steps: acc.steps + d.steps,
      waterMl: acc.waterMl + d.waterMl,
      calories: acc.calories + d.calories,
      activeMinutes: acc.activeMinutes + d.activeMinutes,
    }),
    { steps: 0, waterMl: 0, calories: 0, activeMinutes: 0 },
  );

  const stats = [
    { label: "Steps", total: totals.steps, goal: goals.steps * 7, unit: "" },
    { label: "Water", total: totals.waterMl, goal: goals.waterMl * 7, unit: " ml" },
    { label: "Calories", total: totals.calories, goal: goals.calories * 7, unit: " kcal" },
    { label: "Active minutes", total: totals.activeMinutes, goal: goals.activeMinutes * 7, unit: " min" },
  ];

  const goalDays = week.filter((d) => d.steps >= goals.steps).length;
  const weekWorkoutMinutes = workouts
    .filter((w) => week.some((d) => d.date === w.date))
    .reduce((s, w) => s + w.durationMin, 0);
  const bestDay = week.reduce<(typeof week)[number] | undefined>(
    (best, d) => (!best || d.steps > best.steps ? d : best),
    undefined,
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold sm:text-4xl">Progress</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        How the last 7 days stack up against your daily goals.
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/70 p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Step goal hit</p>
          <p className="mt-2 font-display text-3xl font-bold">{goalDays}/7 days</p>
        </Card>
        <Card className="border-border/60 bg-card/70 p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Workout minutes</p>
          <p className="mt-2 font-display text-3xl font-bold">{weekWorkoutMinutes} min</p>
        </Card>
        <Card className="border-border/60 bg-card/70 p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Best day</p>
          <p className="mt-2 font-display text-3xl font-bold">{bestDay ? bestDay.steps.toLocaleString() : 0}</p>
          <p className="text-xs text-muted-foreground">{bestDay ? prettyDate(bestDay.date) : "—"}</p>
        </Card>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Steps per day</CardTitle>
            <CardDescription>Bar view of the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart data={week} metric="steps" variant="bar" />
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Calories burned</CardTitle>
            <CardDescription>Trend across the week.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart data={week} metric="calories" variant="area" />
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Water intake</CardTitle>
            <CardDescription>Millilitres logged each day.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart data={week} metric="waterMl" variant="bar" />
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active minutes</CardTitle>
            <CardDescription>Time spent moving.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart data={week} metric="activeMinutes" variant="area" />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/60 bg-card/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weekly goal completion</CardTitle>
          <CardDescription>Totals compared with seven days of your daily targets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {stats.map((s) => {
            const p = Math.min(100, Math.round(pct(s.total, s.goal)));
            return (
              <div key={s.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {s.total.toLocaleString()}
                    {s.unit} / {s.goal.toLocaleString()}
                    {s.unit} · {p}%
                  </span>
                </div>
                <Progress value={p} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="mt-6">
        <DataControls />
      </div>
    </main>
  );
}
