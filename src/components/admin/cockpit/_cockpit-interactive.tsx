"use client";

// ============================================================
// Cockpit-interaktivitet (client-leafs for den server-rendrede
// AgencyCockpit). Holdt som rene serialiserbare props (ingen
// icon-funksjoner over server→client-grensen) — derfor importerer
// disse sine egne lucide-ikoner lokalt.
//
//   • TasksSection — oppgave-rader med LOKAL «gjort»-state (optimistisk,
//     ingen oppgave-modell forventes i cockpit-oversikten) + «+ NY»-modal
//     som legger en oppgave i den lokale lista.
//   • FilterChip   — kolonne-filteret er ikke meningsfullt ennå på tvers
//     av de tre kolonnene, så det er tydelig disablet med «Kommer».
//
// Token-only farger, lucide-ikoner, norsk bokmål. Ingen falsk
// «lagret på server» — lokal liste forsvinner ved refresh, og det er
// ærlig for en oversiktsflate.
// ============================================================

import { useId, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CockpitTaskSeed = {
  id: string;
  label: string;
  done?: boolean;
  tag: string;
  due?: boolean;
};

// ── Oppgaver: lokal toggle + «+ NY»-modal ───────────────────────
export function TasksSection({
  initialTasks,
  doneToday,
  totalToday,
}: {
  initialTasks: CockpitTaskSeed[];
  doneToday: number;
  totalToday: number;
}) {
  const [tasks, setTasks] = useState<CockpitTaskSeed[]>(initialTasks);
  const [adding, setAdding] = useState(false);

  // Live-teller fra lokal state, men aldri under server-tallet (de
  // server-talte ferdige oppgavene er sann historikk for dagen).
  const localDone = tasks.filter((t) => t.done).length;
  const done = Math.max(doneToday, localDone);
  const total = Math.max(totalToday, tasks.length);

  function toggle(id: string) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function addTask(label: string) {
    setTasks((ts) => [
      ...ts,
      { id: `local-${Date.now()}`, label, tag: "NY", done: false },
    ]);
  }

  return (
    <div className="border-t border-border px-3.5 pb-3.5 pt-3.5">
      <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
          OPPGAVER
        </span>
        <span className="font-mono text-[10px] font-bold text-muted-foreground">
          {done} av {total} i dag
        </span>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
        >
          <Plus className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
          NY
        </button>
      </div>

      {tasks.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => toggle(t.id)}
          aria-pressed={t.done}
          className="grid w-full grid-cols-[18px_1fr_auto] items-center gap-x-2.5 rounded-md px-2 py-[7px] text-left hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
        >
          <span
            className={cn(
              "inline-flex h-4 w-4 items-center justify-center rounded border-[1.5px]",
              t.done
                ? "border-primary bg-primary text-accent"
                : "border-input bg-card text-transparent",
            )}
          >
            {t.done && <Check className="h-[11px] w-[11px]" strokeWidth={3} aria-hidden />}
          </span>
          <span
            className={cn(
              "text-xs leading-snug tracking-[-0.005em]",
              t.done ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            {t.label}
          </span>
          <span
            className={cn(
              "font-mono text-[9px] font-bold uppercase tracking-[0.10em]",
              t.due ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {t.tag}
          </span>
        </button>
      ))}

      <NewTaskModal open={adding} onClose={() => setAdding(false)} onAdd={addTask} />
    </div>
  );
}

function NewTaskModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (label: string) => void;
}) {
  const [value, setValue] = useState("");

  function close() {
    setValue("");
    onClose();
  }

  function submit() {
    const label = value.trim();
    if (label.length === 0) return;
    onAdd(label);
    close();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : close())}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Ny oppgave</DialogTitle>
          <DialogDescription>
            Legges i dagens liste her i oversikten.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <label className="block space-y-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Oppgave
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Hva skal gjøres …"
              autoFocus
            />
          </label>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost-light" onClick={close}>
            Avbryt
          </Button>
          <Button onClick={submit} disabled={value.trim().length === 0}>
            Legg til
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Kolonne-filter: disablet «Kommer» (ikke meningsfullt ennå) ──
export function FilterChip({ label }: { label: string }) {
  const tipId = useId();
  return (
    <span className="relative ml-auto inline-flex">
      <button
        type="button"
        disabled
        aria-describedby={tipId}
        className="peer inline-flex h-[22px] cursor-not-allowed items-center gap-1 rounded-full bg-secondary px-2 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground opacity-70"
      >
        {label}
        <ChevronDown className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
      </button>
      <span
        id={tipId}
        role="tooltip"
        className="pointer-events-none absolute right-0 top-[26px] z-10 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground opacity-0 shadow-md transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100"
      >
        Kommer
      </span>
    </span>
  );
}
