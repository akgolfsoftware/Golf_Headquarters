"use client";

// LockedAnchorEditor — modal for fast tidsavtale i ukestrukturen.
//
// Eksempel: "WANG Toppidrett 08-10 hver mandag" — disse låses inn i kalenderen
// før øvrige økter genereres.

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartDateInput } from "./SmartDateInput";
import type { PyramidArea } from "@/generated/prisma/client";

export type AnkerFormVerdier = {
  navn: string;
  pyramide: PyramidArea;
  ukedag: number;
  startTid: string;
  sluttTid: string;
  startDato: Date | null;
  sluttDato: Date | null;
  beskrivelse: string;
  fysMuskelgruppe: string | null;
  fysTreningstype: string | null;
};

type Props = {
  apen: boolean;
  studentId?: string;
  initial?: Partial<AnkerFormVerdier>;
  onLukk: () => void;
  onLagre: (verdier: AnkerFormVerdier) => Promise<void> | void;
};

const AREAS: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const UKEDAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

function varighetMin(start: string, slutt: string): number {
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(slutt)) return 0;
  const [hs, ms] = start.split(":").map(Number);
  const [he, me] = slutt.split(":").map(Number);
  return he * 60 + me - (hs * 60 + ms);
}

export function LockedAnchorEditor({ apen, studentId, initial, onLukk, onLagre }: Props) {
  const [navn, setNavn] = useState(initial?.navn ?? "");
  const [pyramide, setPyramide] = useState<PyramidArea>(initial?.pyramide ?? "FYS");
  const [ukedag, setUkedag] = useState<number>(initial?.ukedag ?? 1);
  const [startTid, setStartTid] = useState(initial?.startTid ?? "08:00");
  const [sluttTid, setSluttTid] = useState(initial?.sluttTid ?? "10:00");
  const [startDato, setStartDato] = useState<Date | null>(initial?.startDato ?? null);
  const [sluttDato, setSluttDato] = useState<Date | null>(initial?.sluttDato ?? null);
  const [beskrivelse, setBeskrivelse] = useState(initial?.beskrivelse ?? "");
  const [fysMuskelgruppe, setFysMuskelgruppe] = useState(initial?.fysMuskelgruppe ?? "");
  const [fysTreningstype, setFysTreningstype] = useState(initial?.fysTreningstype ?? "");
  const [lagrer, setLagrer] = useState(false);

  if (!apen) return null;

  const minutter = varighetMin(startTid, sluttTid);
  const gyldig = navn.length > 0 && minutter > 0 && startDato && sluttDato;

  async function handleLagre() {
    if (!gyldig) return;
    setLagrer(true);
    try {
      await onLagre({
        navn,
        pyramide,
        ukedag,
        startTid,
        sluttTid,
        startDato,
        sluttDato,
        beskrivelse,
        fysMuskelgruppe: pyramide === "FYS" ? fysMuskelgruppe || null : null,
        fysTreningstype: pyramide === "FYS" ? fysTreningstype || null : null,
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
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-2xl text-foreground">Fast avtale</h2>
            <p className="text-xs text-muted-foreground">
              Låser tid og pyramide-område til samme ukedag hver uke
            </p>
          </div>
          <button
            type="button"
            onClick={onLukk}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex flex-col gap-4 overflow-auto p-6">
          {/* Navn */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Navn
            </label>
            <input
              type="text"
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              placeholder="f.eks. WANG Toppidrett"
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Område
              </label>
              <select
                value={pyramide}
                onChange={(e) => setPyramide(e.target.value as PyramidArea)}
                className="h-10 w-full rounded-md border border-input bg-card px-2 text-sm focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ukedag
              </label>
              <select
                value={ukedag}
                onChange={(e) => setUkedag(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-input bg-card px-2 text-sm focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                {UKEDAGER.map((u, i) => (
                  <option key={u} value={i + 1}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Varighet
              </label>
              <div
                className={cn(
                  "flex h-10 items-center rounded-md border bg-secondary px-3 font-mono text-sm tabular-nums",
                  minutter > 0 ? "border-border" : "border-destructive text-destructive",
                )}
              >
                {minutter} min
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Start-tid
              </label>
              <input
                type="time"
                value={startTid}
                onChange={(e) => setStartTid(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-card px-3 font-mono text-sm tabular-nums focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Slutt-tid
              </label>
              <input
                type="time"
                value={sluttTid}
                onChange={(e) => setSluttTid(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-card px-3 font-mono text-sm tabular-nums focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Gjelder fra
              </label>
              <SmartDateInput spilllerId={studentId} onChange={(d) => setStartDato(d)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Gjelder til
              </label>
              <SmartDateInput spilllerId={studentId} onChange={(d) => setSluttDato(d)} />
            </div>
          </div>

          {pyramide === "FYS" && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-secondary/30 p-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Muskelgruppe
                </label>
                <input
                  type="text"
                  value={fysMuskelgruppe}
                  onChange={(e) => setFysMuskelgruppe(e.target.value)}
                  placeholder="f.eks. ben"
                  className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Treningstype
                </label>
                <input
                  type="text"
                  value={fysTreningstype}
                  onChange={(e) => setFysTreningstype(e.target.value)}
                  placeholder="f.eks. styrke"
                  className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Beskrivelse
            </label>
            <textarea
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border bg-card px-6 py-3">
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
            disabled={!gyldig || lagrer}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {lagrer ? "Lagrer …" : "Lagre"}
          </button>
        </footer>
      </div>
    </div>
  );
}
