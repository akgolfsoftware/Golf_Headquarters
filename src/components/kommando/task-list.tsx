"use client";

// Oppgaveliste for Kommando. Rendrer fra server-data (initialTasks); mutasjoner
// går via server actions som revaliderer siden. Oppgaver kan knyttes til et
// prosjekt og få en frist (frist vises i kalenderen).

import { Tag } from "@/components/athletic/golfdata";
import { useState, useTransition } from "react";
import { Plus, Trash2, Check, FolderOpen, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
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
  projectName: string | null;
  dueAt: string | null; // ISO eller null
};

export type ProjectOption = { id: string; name: string };

function formatDue(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export function TaskList({
  initialTasks,
  projects,
}: {
  initialTasks: KommandoTaskView[];
  projects: ProjectOption[];
}) {
  const [title, setTitle] = useState("");
  const [haster, setHaster] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [due, setDue] = useState("");
  const [pending, startTransition] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    startTransition(async () => {
      await createKommandoTask({
        title: t,
        priority: haster ? "haster" : "normal",
        projectId: projectId || null,
        dueAt: due || null,
      });
      setTitle("");
      setHaster(false);
      setProjectId("");
      setDue("");
    });
  }

  return (
    <div>
      <form onSubmit={add} className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ny oppgave…"
            className="h-11 flex-1 rounded-lg border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent"
          />
          <button
            type="submit"
            disabled={pending || title.trim().length === 0}
            aria-label="Legg til"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-accent text-accent-foreground transition-opacity disabled:opacity-40"
          >
            <Plus className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHaster((v) => !v)}
            className={cn(
              "h-9 rounded-lg px-3 font-mono text-[11px] font-bold uppercase tracking-[0.05em] transition-colors",
              haster
                ? "bg-warning/15 text-warning"
                : "border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            Haster
          </button>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground outline-none focus:border-accent"
            aria-label="Prosjekt"
          >
            <option value="">Uten prosjekt</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            aria-label="Frist"
            className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground outline-none focus:border-accent"
          />
        </div>
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
                    "flex h-5 w-5 flex-none items-center justify-center rounded-md border transition-colors",
                    done ? "border-success bg-success/20 text-success" : "border-border text-transparent",
                  )}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <div className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm",
                      done ? "text-muted-foreground line-through" : "text-foreground",
                    )}
                  >
                    {task.title}
                  </span>
                  {(task.projectName || task.dueAt) && (
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
                      {task.projectName && (
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" strokeWidth={1.5} /> {task.projectName}
                        </span>
                      )}
                      {task.dueAt && (
                        <span className="flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" strokeWidth={1.5} /> {formatDue(task.dueAt)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {task.priority === "haster" && !done && <Tag variant="warn">Haster</Tag>}
                <button
                  type="button"
                  aria-label="Slett"
                  disabled={pending}
                  onClick={() => startTransition(() => deleteKommandoTask(task.id))}
                  className="flex-none text-muted-foreground/60 transition-colors hover:text-destructive"
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
