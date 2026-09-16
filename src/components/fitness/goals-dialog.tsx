import { useState } from "react";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions } from "@/lib/fitness/store";
import type { Goals } from "@/lib/fitness/types";

const FIELDS: Array<{ key: keyof Goals; label: string; min: number; max: number }> = [
  { key: "steps", label: "Daily steps", min: 1000, max: 60000 },
  { key: "waterMl", label: "Water (ml)", min: 250, max: 8000 },
  { key: "calories", label: "Calories burned", min: 50, max: 5000 },
  { key: "activeMinutes", label: "Active minutes", min: 5, max: 600 },
];

export function GoalsDialog({ goals }: { goals: Goals }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDraft(Object.fromEntries(FIELDS.map((f) => [f.key, String(goals[f.key])])));
      setErrors({});
    }
  }

  function save() {
    const nextErrors: Record<string, string> = {};
    const values = {} as Goals;
    for (const f of FIELDS) {
      const n = Number(draft[f.key]);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < f.min || n > f.max) {
        nextErrors[f.key] = `Enter a whole number between ${f.min.toLocaleString()} and ${f.max.toLocaleString()}`;
      } else {
        values[f.key] = n;
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    actions.setGoals(values);
    toast.success("Daily goals updated");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="size-4" />
          Goals
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize daily goals</DialogTitle>
          <DialogDescription>These targets drive every progress bar in the app.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label htmlFor={`goal-${f.key}`}>{f.label}</Label>
              <Input
                id={`goal-${f.key}`}
                inputMode="numeric"
                value={draft[f.key] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                aria-invalid={Boolean(errors[f.key])}
              />
              {errors[f.key] ? <p className="text-xs text-destructive">{errors[f.key]}</p> : null}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save goals</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
