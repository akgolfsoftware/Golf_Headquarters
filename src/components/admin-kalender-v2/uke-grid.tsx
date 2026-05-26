"use client";

/**
 * Kalender uke-grid — 7-dagers grid Man-Søn med tidsslot-akse.
 * Økt-blokker fargekodet per pyramide. Filter alle/mine/ledig.
 * "+"-CTA i tomme celler (visuell mock).
 */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Filter as FilterIcon } from "lucide-react";

export type UkeOkt = {
  id: string;
  dag: number; // 0 = mandag
  startTime: string; // "09:30"
  endTime: string;
  title: string;
  pyramide: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  coachId: string;
  coachNavn: string;
  spillerNavn: string | null;
};

const PYRAMIDE_FARGER: Record<UkeOkt["pyramide"], { bg: string; border: string; fg: string }> = {
  FYS: { bg: "hsl(var(--primary))", border: "hsl(var(--primary))", fg: "hsl(var(--accent))" },
  TEK: { bg: "hsl(var(--success))", border: "hsl(var(--primary))", fg: "#FFFFFF" },
  SLAG: { bg: "rgba(209,248,67,0.55)", border: "hsl(var(--accent))", fg: "hsl(var(--foreground))" },
  SPILL: { bg: "rgba(184,133,42,0.30)", border: "hsl(var(--warning))", fg: "hsl(var(--foreground))" },
  TURN: { bg: "rgba(94,92,87,0.20)", border: "hsl(var(--muted-foreground))", fg: "hsl(var(--foreground))" },
};

const DAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

// Tidsslots — 7:00 til 21:00 i halvtimer
const SLOTS: string[] = [];
for (let h = 7; h < 21; h++) {
  SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

// timestring → minutter etter midnatt
function tilMin(t: string): number {
  const [h, m] = t.split(":").map((s) => parseInt(s, 10));
  return h * 60 + m;
}

const GRID_START_MIN = 7 * 60;
const SLOT_HEIGHT = 28; // px per 30 min slot

export function UkeGrid({ okter, currentUserId }: { okter: UkeOkt[]; currentUserId: string }) {
  const [filter, setFilter] = useState<"alle" | "mine" | "ledig">("alle");
  const [ukeOffset, setUkeOffset] = useState(0);

  const visOkter = okter.filter((o) => {
    if (filter === "mine") return o.coachId === currentUserId;
    if (filter === "ledig") return false; // viser bare tomme celler
    return true;
  });

  // Beregn ukestart-dato (mandag)
  const idag = new Date();
  const dagIUken = (idag.getDay() + 6) % 7; // 0=man
  const ukeStart = new Date(idag);
  ukeStart.setDate(idag.getDate() - dagIUken + ukeOffset * 7);

  const ukeNummer = getISOWeek(ukeStart);

  return (
    <div className="space-y-4">
      {/* Sticky topbar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUkeOffset(ukeOffset - 1)}
            className="rounded-full border border-border p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Forrige uke"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setUkeOffset(0)}
            className="rounded-full border border-border px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
          >
            I dag
          </button>
          <button
            type="button"
            onClick={() => setUkeOffset(ukeOffset + 1)}
            className="rounded-full border border-border p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Neste uke"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="font-display text-lg font-semibold tracking-tight text-foreground">
          Uke {ukeNummer}
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            {fmtKortDato(ukeStart)} — {fmtKortDato(addDays(ukeStart, 6))}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <FilterIcon size={14} className="text-muted-foreground" />
          <div className="inline-flex gap-1 rounded-full bg-secondary p-1">
            {(["alle", "mine", "ledig"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1 text-xs font-medium transition ${
                  filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "alle" ? "Alle" : f === "mine" ? "Mine" : "Ledig"}
              </button>
            ))}
          </div>
          <Link
            href="/admin/kalender/maned"
            className="ml-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Måned →
          </Link>
        </div>
      </div>

      {/* 7-dagers grid */}
      <div className="rounded-2xl border border-border bg-card p-4 overflow-x-auto">
        <div className="grid min-w-[800px]" style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}>
          {/* Header */}
          <div />
          {DAGER.map((d, i) => {
            const dato = addDays(ukeStart, i);
            const erIdag = sameDay(dato, idag) && ukeOffset === 0;
            return (
              <div
                key={d}
                className={`border-b border-border pb-2 text-center ${
                  erIdag ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.10em]">{d}</div>
                <div
                  className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full font-display text-sm font-semibold ${
                    erIdag ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {dato.getDate()}
                </div>
              </div>
            );
          })}

          {/* Tidsslot-akse */}
          <div className="relative">
            {SLOTS.filter((_, i) => i % 2 === 0).map((s) => (
              <div
                key={s}
                style={{ height: SLOT_HEIGHT * 2 }}
                className="pr-2 pt-1 text-right font-mono text-[10px] tabular-nums text-muted-foreground"
              >
                {s}
              </div>
            ))}
          </div>

          {/* Dag-kolonner */}
          {DAGER.map((_, dagIdx) => (
            <DagKolonne
              key={dagIdx}
              okter={visOkter.filter((o) => o.dag === dagIdx)}
              filter={filter}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DagKolonne({
  okter,
  filter,
}: {
  okter: UkeOkt[];
  filter: "alle" | "mine" | "ledig";
}) {
  return (
    <div className="relative border-l border-border" style={{ minHeight: SLOTS.length * SLOT_HEIGHT }}>
      {/* Bakgrunns-slots med hover-+ */}
      {SLOTS.map((s) => (
        <div
          key={s}
          className="group relative border-b border-border/50"
          style={{ height: SLOT_HEIGHT }}
        >
          {(filter === "ledig" || filter === "alle") && (
            <button
              type="button"
              aria-label={`Legg til økt ${s}`}
              className="absolute inset-0 hidden items-center justify-center opacity-0 transition group-hover:flex group-hover:opacity-100"
            >
              <span className="rounded-full bg-primary p-1 text-primary-foreground">
                <Plus size={12} />
              </span>
            </button>
          )}
        </div>
      ))}

      {/* Økt-blokker (absolutt-posisjonerte) */}
      {okter.map((o) => {
        const startMin = tilMin(o.startTime) - GRID_START_MIN;
        const sluttMin = tilMin(o.endTime) - GRID_START_MIN;
        const top = (startMin / 30) * SLOT_HEIGHT;
        const height = ((sluttMin - startMin) / 30) * SLOT_HEIGHT - 2;
        const f = PYRAMIDE_FARGER[o.pyramide];
        return (
          <div
            key={o.id}
            className="absolute left-1 right-1 cursor-pointer rounded-md border px-2 py-1 text-[11px] leading-tight"
            style={{
              top,
              height: Math.max(height, 24),
              background: f.bg,
              borderColor: f.border,
              color: f.fg,
            }}
            title={`${o.title} · ${o.spillerNavn ?? ""} · ${o.coachNavn}`}
          >
            <div className="font-mono font-semibold tracking-tight">
              {o.startTime}
            </div>
            <div className="line-clamp-1 font-medium">{o.title}</div>
            {o.spillerNavn && height > 50 && (
              <div className="line-clamp-1 opacity-80">{o.spillerNavn}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Date utils ---

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function fmtKortDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function getISOWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
