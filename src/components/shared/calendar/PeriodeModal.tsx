"use client";

// PeriodeModal — opprett/rediger periode med constraints-panel.
//
// Layout: 60/40 to-kolonne. Venstre = skjema, høyre = constraints (auto).

import { useMemo, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartDateInput } from "./SmartDateInput";
import {
  PERIODE_FARGER,
  PERIODE_LABELS,
} from "@/lib/portal/training/ak-taxonomy";
import { getPeriodeConstraints } from "@/lib/portal/training/periode-constraints";
import type { PeriodeType, PyramidArea } from "@/generated/prisma/client";

export type PeriodeFormVerdier = {
  type: PeriodeType;
  fra: Date | null;
  til: Date | null;
  focus: string;
  pyramideOverride: Record<PyramidArea, number>;
  notater: string;
};

type Props = {
  apen: boolean;
  initial?: Partial<PeriodeFormVerdier>;
  spilllerId?: string;
  onLukk: () => void;
  onLagre: (verdier: PeriodeFormVerdier) => Promise<void> | void;
};

const TYPER: PeriodeType[] = ["GRUNN", "SPESIALISERING", "TURNERING", "EVALUERING", "FERIE"];
const AREAS: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

function defaultFordeling(): Record<PyramidArea, number> {
  return { FYS: 20, TEK: 20, SLAG: 20, SPILL: 20, TURN: 20 };
}

export function PeriodeModal({ apen, initial, spilllerId, onLukk, onLagre }: Props) {
  const [type, setType] = useState<PeriodeType>(initial?.type ?? "GRUNN");
  const [fra, setFra] = useState<Date | null>(initial?.fra ?? null);
  const [til, setTil] = useState<Date | null>(initial?.til ?? null);
  const [focus, setFocus] = useState(initial?.focus ?? "");
  const [pyramide, setPyramide] = useState<Record<PyramidArea, number>>(
    initial?.pyramideOverride ?? defaultFordeling(),
  );
  const [notater, setNotater] = useState(initial?.notater ?? "");
  const [lagrer, setLagrer] = useState(false);

  const constraints = useMemo(() => getPeriodeConstraints(type), [type]);
  const sum = AREAS.reduce((s, a) => s + (pyramide[a] || 0), 0);
  const gyldigSum = sum === 100;

  if (!apen) return null;

  async function handleLagre() {
    setLagrer(true);
    try {
      await onLagre({
        type,
        fra,
        til,
        focus,
        pyramideOverride: pyramide,
        notater,
      });
    } finally {
      setLagrer(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-2xl text-foreground">Ny periode</h2>
          <button
            type="button"
            onClick={onLukk}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        <div className="grid flex-1 overflow-auto" style={{ gridTemplateColumns: "60% 40%" }}>
          {/* Skjema */}
          <div className="flex flex-col gap-4 border-r border-border p-6">
            {/* Periodetype-kort */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Periodetype
              </label>
              <div className="grid grid-cols-5 gap-2">
                {TYPER.map((t) => {
                  const farge = PERIODE_FARGER[t];
                  const valgt = t === type;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-md border px-2 py-2 text-left text-[11px] transition-all",
                        valgt
                          ? "border-foreground ring-2 ring-ring"
                          : "border-border opacity-80 hover:opacity-100",
                      )}
                      style={{ backgroundColor: farge.bg, color: farge.text }}
                    >
                      <span className="font-semibold">{PERIODE_LABELS[t]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Datoer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fra
                </label>
                <SmartDateInput
                  spilllerId={spilllerId}
                  defaultValue={fra ? fra.toLocaleDateString("no-NO") : ""}
                  onChange={(d) => setFra(d)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Til
                </label>
                <SmartDateInput
                  spilllerId={spilllerId}
                  defaultValue={til ? til.toLocaleDateString("no-NO") : ""}
                  onChange={(d) => setTil(d)}
                />
              </div>
            </div>

            {/* Focus */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Fokus
              </label>
              <input
                type="text"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="f.eks. Driver shape, putting under press"
                className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Pyramide-override */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Pyramide-fordeling (override)
                </label>
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    gyldigSum ? "text-foreground" : "text-destructive",
                  )}
                >
                  sum {sum}%
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {AREAS.map((a) => (
                  <div key={a} className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium text-muted-foreground">
                      {a}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={pyramide[a]}
                      onChange={(e) =>
                        setPyramide({
                          ...pyramide,
                          [a]: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                        })
                      }
                      className="h-9 w-full rounded-md border border-input bg-card px-2 font-mono text-sm tabular-nums focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notater */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notater
              </label>
              <textarea
                value={notater}
                onChange={(e) => setNotater(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Constraints */}
          <div className="flex flex-col gap-4 bg-secondary/50 p-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Anbefalte rammer</h3>
              <p className="text-xs text-muted-foreground">
                For {PERIODE_LABELS[type].toLowerCase()}
              </p>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <span className="font-medium text-foreground">Pyramide min/max (%)</span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground">
                {AREAS.map((a) => (
                  <div key={a} className="flex justify-between font-mono tabular-nums">
                    <span>{a}</span>
                    <span>
                      {constraints.minPyramide[a]}–{constraints.maxPyramide[a]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <span className="font-medium text-foreground">Volum per uke (min)</span>
              <div className="font-mono tabular-nums text-muted-foreground">
                {constraints.volumPerUke.minMin}–{constraints.volumPerUke.maxMin}
              </div>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-border bg-card px-6 py-3">
          {!gyldigSum && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle size={14} strokeWidth={1.5} />
              Sum av pyramide må være 100
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onLukk}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={handleLagre}
              disabled={!gyldigSum || !fra || !til || lagrer}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {lagrer ? "Lagrer …" : "Lagre"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
