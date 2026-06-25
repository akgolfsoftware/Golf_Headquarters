"use client";

// Prosjektliste for Kommando. Server-data inn; mutasjoner via server actions
// som revaliderer siden.

import { useState, useTransition } from "react";
import { Plus, Archive, Trash2, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createKommandoProject,
  archiveKommandoProject,
  deleteKommandoProject,
} from "@/app/kommando/prosjekter/actions";

export type KommandoProjectView = {
  id: string;
  name: string;
  status: string;
  taskCount: number;
};

export function ProjectList({ initialProjects }: { initialProjects: KommandoProjectView[] }) {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    startTransition(async () => {
      await createKommandoProject({ name: n });
      setName("");
    });
  }

  return (
    <div>
      <form onSubmit={add} className="mb-4 flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nytt prosjekt…"
          className="h-11 flex-1 rounded-lg border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending || name.trim().length === 0}
          aria-label="Legg til prosjekt"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-opacity disabled:opacity-40"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </form>

      {initialProjects.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Ingen prosjekter enda.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {initialProjects.map((p) => {
            const archived = p.status === "archived";
            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-xl border border-border bg-card p-4",
                  archived && "opacity-60",
                )}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderOpen className="h-4 w-4 flex-none text-muted-foreground" strokeWidth={1.5} />
                    <span className="truncate font-display text-sm font-semibold text-foreground">
                      {p.name}
                    </span>
                  </div>
                  <div className="flex flex-none items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={archived ? "Aktiver" : "Arkiver"}
                      disabled={pending}
                      onClick={() => startTransition(() => archiveKommandoProject(p.id))}
                      className="text-muted-foreground/60 transition-colors hover:text-foreground"
                    >
                      <Archive className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      aria-label="Slett"
                      disabled={pending}
                      onClick={() => startTransition(() => deleteKommandoProject(p.id))}
                      className="text-muted-foreground/60 transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
                  {p.taskCount} {p.taskCount === 1 ? "oppgave" : "oppgaver"}
                  {archived && " · arkivert"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
