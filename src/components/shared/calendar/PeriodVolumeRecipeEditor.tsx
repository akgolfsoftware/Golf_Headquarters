"use client";

// PeriodVolumeRecipeEditor — definerer ukesvolum-resept for en periode.
//
// Hver rad representerer én PeriodRecipeOkt: pyramide-område, antall per
// uke, varighet, fys-typer (valgfritt), preferert ukedag/tid.

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PyramidArea } from "@/generated/prisma/client";

export type RecipeRad = {
  id: string;
  pyramide: PyramidArea;
  antallPerUke: number;
  varighetMin: number;
  fysTreningstype?: string | null;
  fysMuskelgruppeRotasjon?: string[];
  preferertUkedag?: number | null;
  preferertTid?: string | null;
  notat?: string | null;
};

type Props = {
  rader: RecipeRad[];
  onChange: (rader: RecipeRad[]) => void;
};

const AREAS: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const UKEDAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

function nyId(): string {
  return `rad-${Math.random().toString(36).slice(2, 9)}`;
}

export function PeriodVolumeRecipeEditor({ rader, onChange }: Props) {
  const [draftPyramide, setDraftPyramide] = useState<PyramidArea>("TEK");

  function leggTilRad() {
    onChange([
      ...rader,
      {
        id: nyId(),
        pyramide: draftPyramide,
        antallPerUke: 2,
        varighetMin: 60,
      },
    ]);
  }

  function oppdater(id: string, patch: Partial<RecipeRad>) {
    onChange(rader.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function slett(id: string) {
    onChange(rader.filter((r) => r.id !== id));
  }

  const totalMin = rader.reduce((s, r) => s + r.antallPerUke * r.varighetMin, 0);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Ukesvolum-resept</h3>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {(totalMin / 60).toFixed(1)} t/uke
        </span>
      </header>

      <div className="flex flex-col gap-2">
        {rader.map((r) => (
          <div
            key={r.id}
            className="grid items-center gap-2 rounded-md border border-border bg-secondary/30 p-2"
            style={{ gridTemplateColumns: "80px 70px 90px 1fr 100px 90px 24px" }}
          >
            <select
              value={r.pyramide}
              onChange={(e) =>
                oppdater(r.id, { pyramide: e.target.value as PyramidArea })
              }
              className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={14}
              value={r.antallPerUke}
              onChange={(e) =>
                oppdater(r.id, { antallPerUke: Math.max(1, Number(e.target.value) || 1) })
              }
              className="h-8 rounded-md border border-input bg-card px-2 font-mono text-xs tabular-nums focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              title="Antall per uke"
            />
            <input
              type="number"
              min={15}
              max={300}
              step={15}
              value={r.varighetMin}
              onChange={(e) =>
                oppdater(r.id, { varighetMin: Math.max(15, Number(e.target.value) || 15) })
              }
              className="h-8 rounded-md border border-input bg-card px-2 font-mono text-xs tabular-nums focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              title="Varighet (min)"
            />
            <input
              type="text"
              value={r.notat ?? ""}
              onChange={(e) => oppdater(r.id, { notat: e.target.value })}
              placeholder="Notat (valgfritt)"
              className="h-8 rounded-md border border-input bg-card px-2 text-xs focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            />
            <select
              value={r.preferertUkedag ?? ""}
              onChange={(e) =>
                oppdater(r.id, {
                  preferertUkedag: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="h-8 rounded-md border border-input bg-card px-2 text-xs focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <option value="">Hvilken som helst</option>
              {UKEDAGER.map((u, i) => (
                <option key={u} value={i + 1}>
                  {u}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={r.preferertTid ?? ""}
              onChange={(e) =>
                oppdater(r.id, { preferertTid: e.target.value || null })
              }
              className="h-8 rounded-md border border-input bg-card px-2 font-mono text-xs focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            />
            <button
              type="button"
              onClick={() => slett(r.id)}
              className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Slett rad"
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
        {rader.length === 0 && (
          <p className="rounded-md bg-secondary/40 p-3 text-center text-xs text-muted-foreground">
            Ingen rader. Legg til første rad nedenfor.
          </p>
        )}
      </div>

      <footer className="flex items-center gap-2">
        <select
          value={draftPyramide}
          onChange={(e) => setDraftPyramide(e.target.value as PyramidArea)}
          className="h-9 rounded-md border border-input bg-card px-2 text-xs focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={leggTilRad}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90",
          )}
        >
          <Plus size={14} strokeWidth={1.5} />
          Legg til
        </button>
      </footer>
    </section>
  );
}
