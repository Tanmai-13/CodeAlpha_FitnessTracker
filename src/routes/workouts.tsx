import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Dumbbell, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { actions, useFitnessState } from "@/lib/fitness/store";
import { prettyDate, todayISO } from "@/lib/fitness/date";
import { WORKOUT_TYPES, type Workout } from "@/lib/fitness/types";

export const Route = createFileRoute("/workouts")({
  head: () => ({
    meta: [
      { title: "Workouts — PulseTrack Fitness Tracker" },
      {
        name: "description",
        content: "Add, edit and delete workouts with type, duration, date and notes, and filter the list.",
      },
      { property: "og:title", content: "Workouts — PulseTrack Fitness Tracker" },
      { property: "og:description", content: "A full workout log with filtering and quick editing." },
    ],
  }),
  component: WorkoutsPage,
});

type Draft = { type: string; durationMin: string; date: string; notes: string };

const emptyDraft = (): Draft => ({ type: "Running", durationMin: "", date: todayISO(), notes: "" });

function WorkoutsPage() {
  const { workouts } = useFitnessState();
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [pendingDelete, setPendingDelete] = useState<Workout | null>(null);

  const visible = useMemo(() => {
    const sorted = [...workouts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt));
    return filter === "all" ? sorted : sorted.filter((w) => w.type === filter);
  }, [workouts, filter]);

  const totalMinutes = visible.reduce((s, w) => s + w.durationMin, 0);

  function startAdd() {
    setEditing(null);
    setDraft(emptyDraft());
    setErrors({});
    setOpen(true);
  }

  function startEdit(w: Workout) {
    setEditing(w);
    setDraft({ type: w.type, durationMin: String(w.durationMin), date: w.date, notes: w.notes });
    setErrors({});
    setOpen(true);
  }

  function save() {
    const next: Partial<Record<keyof Draft, string>> = {};
    const duration = Number(draft.durationMin);
    if (!draft.type) next.type = "Choose a workout type";
    if (!draft.durationMin.trim()) next.durationMin = "Duration is required";
    else if (!Number.isFinite(duration) || !Number.isInteger(duration) || duration < 1 || duration > 600)
      next.durationMin = "Enter whole minutes between 1 and 600";
    if (!draft.date) next.date = "Pick a date";
    else if (draft.date > todayISO()) next.date = "Date can't be in the future";
    if (draft.notes.length > 300) next.notes = "Keep notes under 300 characters";

    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      type: draft.type,
      durationMin: duration,
      date: draft.date,
      notes: draft.notes.trim(),
    };

    if (editing) {
      actions.updateWorkout(editing.id, payload);
      toast.success("Workout updated");
    } else {
      actions.addWorkout(payload);
      actions.addActivity(payload.date, { activeMinutes: payload.durationMin });
      toast.success("Workout added");
    }
    setOpen(false);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Workouts</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {visible.length} workout{visible.length === 1 ? "" : "s"} · {totalMinutes} minutes total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {WORKOUT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={startAdd} className="gap-2">
            <Plus className="size-4" />
            Add workout
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <Card className="mt-8 border-dashed border-border/70 bg-card/40">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
              <Dumbbell className="size-7" />
            </span>
            <h2 className="text-lg font-semibold">
              {filter === "all" ? "No workouts yet" : `No ${filter.toLowerCase()} sessions yet`}
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              {filter === "all"
                ? "Log your first session and it will show up here with duration and notes."
                : "Try a different filter, or add a session of this type."}
            </p>
            <Button onClick={startAdd} className="mt-2 gap-2">
              <Plus className="size-4" />
              Add workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-3">
          {visible.map((w) => (
            <Card
              key={w.id}
              className="border-border/60 bg-card/70 p-4 transition-colors hover:border-primary/40 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{w.type}</h3>
                    <Badge variant="secondary">{w.durationMin} min</Badge>
                    <span className="text-xs text-muted-foreground">{prettyDate(w.date)}</span>
                  </div>
                  {w.notes ? (
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{w.notes}</p>
                  ) : (
                    <p className="mt-2 text-sm italic text-muted-foreground/70">No notes</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" aria-label="Edit workout" onClick={() => startEdit(w)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete workout"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setPendingDelete(w)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit workout" : "Add workout"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the details of this session." : "New sessions also add their minutes to that day."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Workout type</Label>
                <Select value={draft.type} onValueChange={(v) => setDraft((d) => ({ ...d, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKOUT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type ? <p className="text-xs text-destructive">{errors.type}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  inputMode="numeric"
                  value={draft.durationMin}
                  aria-invalid={Boolean(errors.durationMin)}
                  onChange={(e) => setDraft((d) => ({ ...d, durationMin: e.target.value }))}
                />
                {errors.durationMin ? <p className="text-xs text-destructive">{errors.durationMin}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wdate">Date</Label>
              <Input
                id="wdate"
                type="date"
                max={todayISO()}
                value={draft.date}
                aria-invalid={Boolean(errors.date)}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              />
              {errors.date ? <p className="text-xs text-destructive">{errors.date}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="How did it feel? Sets, pace, route…"
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              />
              {errors.notes ? <p className="text-xs text-destructive">{errors.notes}</p> : null}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add workout"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this workout?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? `${pendingDelete.type} · ${pendingDelete.durationMin} min · ${prettyDate(pendingDelete.date)}` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  actions.deleteWorkout(pendingDelete.id);
                  toast.success("Workout deleted");
                }
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
