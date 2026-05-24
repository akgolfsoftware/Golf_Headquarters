"use client";

/**
 * Kalender måned-grid — 6-rad måneds-grid.
 * Max 3 økt-pills per dag + "+N til"-overflow.
 * Hover-preview + side-panel-detalj.
 */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type ManedOkt = {
  id: string;
  dato: string; // ISO yyyy-mm-dd
  startTime: string; // "HH:MM"
  endTime: string;
  title: string;
  pyramide: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  spillerNavn: string | null;
  coachNavn: string;
};

const PYRAMIDE_FARGER: Record<ManedOkt["pyramide"], string> = {
  FYS: "#005840",
  TEK: "#1A7D56",
  SLAG: "#BFE933",
  SPILL: "#B8852A",
  TURN: "#5E5C57",
};

const DAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export function ManedGrid({ okter }: { okter: ManedOkt[] }) {
  const idag = new Date();
  const [mndOffset, setMndOffset] = useState(0);
  const [valgtDag, setValgtDag] = useState<string | null>(null);

  const valgtMnd = new Date(idag.getFullYear(), idag.getMonth() + mndOffset, 1);
  const aar = valgtMnd.getFullYear();
  const mnd = valgtMnd.getMonth();

  // Beregn første mandag som vises (kan være i forrige måned)
  const forsteIMnd = new Date(aar, mnd, 1);
  const offset = (forsteIMnd.getDay() + 6) % 7;
  const gridStart = new Date(aar, mnd, 1 - offset);

  // 6 uker × 7 dager = 42 celler
  const celler: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    celler.push(d);
  }

  // Group økter per dato
  const perDato = new Map<string, ManedOkt[]>();
  for (const o of okter) {
    const arr = perDato.get(o.dato) ?? [];
    arr.push(o);
    perDato.set(o.dato, arr);
  }

  const valgteOkter = valgtDag ? perDato.get(valgtDag) ?? [] : [];

  return (
    <div className="space-y-4">
      {/* Topbar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMndOffset(mndOffset - 1)}
            className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Forrige måned"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setMndOffset(0)}
            className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
          >
            I dag
          </button>
          <button
            type="button"
            onClick={() => setMndOffset(mndOffset + 1)}
            className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Neste måned"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="font-display text-lg font-semibold tracking-tight capitalize">
          {valgtMnd.toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/admin/kalender/uke"
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            ← Uke
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Måneds-grid */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
          <div className="grid grid-cols-7">
            {DAGER.map((d) => (
              <div key={d} className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-6 gap-px overflow-hidden rounded-lg border border-border bg-border">
            {celler.map((d, i) => {
              const iso = isoDato(d);
              const erDenneMnd = d.getMonth() === mnd;
              const erIdag = sameDay(d, idag);
              const dagOkter = perDato.get(iso) ?? [];
              const vis3 = dagOkter.slice(0, 3);
              const overflow = dagOkter.length - vis3.length;
              const erValgt = valgtDag === iso;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setValgtDag(iso)}
                  className={`min-h-[100px] cursor-pointer bg-card p-2 text-left transition hover:bg-secondary/50 ${
                    !erDenneMnd ? "opacity-40" : ""
                  } ${erValgt ? "ring-2 ring-primary ring-inset" : ""}`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-semibold ${
                        erIdag ? "bg-primary text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    {dagOkter.length > 0 && (
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {dagOkter.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {vis3.map((o) => (
                      <div
                        key={o.id}
                        className="truncate rounded-sm border-l-[3px] bg-secondary/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground"
                        style={{ borderColor: PYRAMIDE_FARGER[o.pyramide] }}
                      >
                        <span className="font-mono text-[9px] text-muted-foreground">{o.startTime}</span> {o.title}
                      </div>
                    ))}
                    {overflow > 0 && (
                      <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                        +{overflow} til
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
            </div>
          </div>
        </div>

        {/* Side-panel */}
        <aside className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-4">
          {valgtDag ? (
            <div>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Dag-detalj</div>
                  <div className="mt-1 font-display text-xl font-semibold tracking-tight capitalize">
                    {new Date(valgtDag).toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setValgtDag(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Lukk"
                >
                  <X size={16} />
                </button>
              </div>
              {valgteOkter.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ingen økter denne dagen.</p>
              ) : (
                <ul className="space-y-2">
                  {valgteOkter.map((o) => (
                    <li
                      key={o.id}
                      className="rounded-lg border-l-[3px] border-border bg-secondary/40 p-3"
                      style={{ borderLeftColor: PYRAMIDE_FARGER[o.pyramide] }}
                    >
                      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        {o.startTime}–{o.endTime} · {o.pyramide}
                      </div>
                      <div className="mt-1 font-display text-sm font-semibold text-foreground">{o.title}</div>
                      {o.spillerNavn && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {o.spillerNavn} · {o.coachNavn}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="text-sm">Klikk en dag for å se økter</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isoDato(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
