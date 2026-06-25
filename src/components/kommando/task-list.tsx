"use client";

// Oppgaveliste for Kommando. Rendrer fra server-data (initialTasks); mutasjoner
// går via server actions som revaliderer siden, så lista oppdateres av seg selv.

import { useState, useTransition } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticBadge } from "@/components/athletic";
import {
  createKommandoTask,
  toggleKommandoTask,
  deleteKommandoTask,
} from "@/app/kommando/oppgaver/actions";

export type KommandoTaskView = {
  id: string;
  title: string;
  status: string;
  priority: string;
};

export function TaskList({ initialTasks }: { initialTasks: KommandoTaskView[] }) {
  const [title, setTitle] = useState("");
  const [haster, setHaster] = useState(false);
  const [pending, startTransition] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    startTransition(async () => {
      await createKommandoTask({ title: t, priority: haster ? "haster" : "normal" });
      setTitle("");
      setHaster(false);
    });
  }

  return (
    <div>
      <form onSubmit={add} className="mb-4 flex items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ny oppgave…"
          className="h-11 flex-1 rounded-lg border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent"
        />
        <button
          type="button"
          onClick={() => setHaster((v) => !v)}
          className={cn(
            "h-11 rounded-lg px-3 font-mono text-[11px] font-bold uppercase tracking-[0.05em] transition-colors",
            haster
              ? "bg-warning/15 text-warning"
              : "border border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Haster
        </button>
        <button
          type="submit"
          disabled={pending || title.trim().length === 0}
          aria-label="Legg til"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-opacity disabled:opacity-40"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </form>

      {initialTasks.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Ingen oppgaver enda.</p>
      ) : (
        <ul className="space-y-1.5">
          {initialTasks.map((task) => {
            const done = task.status === "done";
            return (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <button
                  type="button"
                  aria-label={done ? "Marker som åpen" : "Marker som ferdig"}
                  disabled={pending}
                  onClick={() => startTransition(() => toggleKommandoTask(task.id))}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
                    done ? "border-success bg-success/20 text-success" : "border-border text-transparent",
                  )}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    done ? "text-muted-foreground line-through" : "text-foreground",
                  )}
                >
                  {task.title}
                </span>
                {task.priority === "haster" && !done && <AthleticBadge variant="warn">Haster</AthleticBadge>}
                <button
                  type="button"
                  aria-label="Slett"
                  disabled={pending}
                  onClick={() => startTransition(() => deleteKommandoTask(task.id))}
                  className="text-muted-foreground/60 transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
