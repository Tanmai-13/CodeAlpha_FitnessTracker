import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Droplets, Flame, Footprints, Timer, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/fitness/metric-card";
import { WeeklyChart, type WeeklyPoint } from "@/components/fitness/weekly-chart";
import { GoalsDialog } from "@/components/fitness/goals-dialog";
import { DataControls } from "@/components/fitness/data-controls";
import { actions, useFitnessState } from "@/lib/fitness/store";
import { logFor, pct, weeklyPoints } from "@/lib/fitness/selectors";
import { prettyDate, todayISO } from "@/lib/fitness/date";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — PulseTrack Fitness Tracker" },
      {
        name: "description",
        content:
          "See today's steps, water, calories and active minutes against your daily goals, plus a 7-day trend.",
      },
      { property: "og:title", content: "Dashboard — PulseTrack Fitness Tracker" },
      {
        property: "og:description",
        content: "Today's fitness summary with goal progress and a weekly activity chart.",
      },
    ],
  }),
  component: Dashboard,
});

const QUICK = [
  { label: "+1,000 steps", delta: { steps: 1000 } },
  { label: "+250 ml water", delta: { waterMl: 250 } },
  { label: "+100 kcal", delta: { calories: 100 } },
  { label: "+10 min", delta: { activeMinutes: 10 } },
] as const;

function Dashboard() {
  const { logs, goals, workouts } = useFitnessState();
  const today = todayISO();
  const t = logFor(logs, today);
  const week = weeklyPoints(logs);
  const [metric, setMetric] = useState<keyof Omit<WeeklyPoint, "label" | "date">>("steps");

  const weekSteps = week.reduce((s, d) => s + d.steps, 0);
  const todaysWorkouts = workouts.filter((w) => w.date === today);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">{prettyDate(today)}</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Today&apos;s summary</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {weekSteps.toLocaleString()} steps in the last 7 days · {todaysWorkouts.length} workout
            {todaysWorkouts.length === 1 ? "" : "s"} logged today
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GoalsDialog goals={goals} />
          <Button asChild size="sm" className="gap-2">
            <Link to="/log">
              <Plus className="size-4" />
              Log activity
            </Link>
          </Button>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Steps"
          value={t.steps.toLocaleString()}
          goalLabel={`Goal ${goals.steps.toLocaleString()}`}
          percent={pct(t.steps, goals.steps)}
          icon={Footprints}
          tone="steps"
        />
        <MetricCard
          label="Water"
          value={t.waterMl.toLocaleString()}
          unit="ml"
          goalLabel={`Goal ${goals.waterMl.toLocaleString()} ml`}
          percent={pct(t.waterMl, goals.waterMl)}
          icon={Droplets}
          tone="water"
        />
        <MetricCard
          label="Calories burned"
          value={t.calories.toLocaleString()}
          unit="kcal"
          goalLabel={`Goal ${goals.calories.toLocaleString()} kcal`}
          percent={pct(t.calories, goals.calories)}
          icon={Flame}
          tone="calories"
        />
        <MetricCard
          label="Workout time"
          value={String(t.activeMinutes)}
          unit="min"
          goalLabel={`Goal ${goals.activeMinutes} min`}
          percent={pct(t.activeMinutes, goals.activeMinutes)}
          icon={Timer}
          tone="minutes"
        />
      </section>

      <Card className="mt-6 border-border/60 bg-card/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick add</CardTitle>
          <CardDescription>One tap to top up today&apos;s numbers.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <Button
              key={q.label}
              variant="secondary"
              size="sm"
              className="transition-transform active:scale-95"
              onClick={() => {
                actions.addActivity(today, q.delta);
                toast.success(`Added ${q.label.replace("+", "")}`);
              }}
            >
              {q.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6 border-border/60 bg-card/70">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-2">
          <div>
            <CardTitle className="text-base">Last 7 days</CardTitle>
            <CardDescription>Daily totals across the week.</CardDescription>
          </div>
          <Tabs value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
            <TabsList>
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="waterMl">Water</TabsTrigger>
              <TabsTrigger value="calories">Calories</TabsTrigger>
              <TabsTrigger value="activeMinutes">Minutes</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <WeeklyChart data={week} metric={metric} variant="area" />
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="link" className="gap-1 px-0">
          <Link to="/progress">
            View full progress breakdown <ArrowRight className="size-4" />
          </Link>
        </Button>
        <DataControls />
      </div>
    </main>
  );
}
