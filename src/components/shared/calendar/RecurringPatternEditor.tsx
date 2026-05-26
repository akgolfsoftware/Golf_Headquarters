"use client";

// RecurringPatternEditor — bygger en rrule-streng fra UI-valg.
//
// Støtter de mest brukte mønstrene: ukentlig på spesifikke dager,
// annenhver uke, månedlig på dato, etc. Lar brukeren se rå rrule-tekst.

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { RRule, Frequency } from "rrule";
import { cn } from "@/lib/utils";
import type { PyramidArea } from "@/generated/prisma/client";
import { SmartDateInput } from "./SmartDateInput";

export type RecurringFormVerdier = {
  navn: string;
  pyramide: PyramidArea;
  frekvens: "DAILY" | "WEEKLY" | "MONTHLY";
  intervall: number;
  ukedager: number[];
  startDato: Date | null;
  sluttDato: Date | null;
  startTid: string;
  varighetMin: number;
  beskrivelse: string;
  rrule: string;
};

type Props = {
  apen: boolean;
  studentId?: string;
  initial?: Partial<RecurringFormVerdier>;
  onLukk: () => void;
  onLagre: (verdier: RecurringFormVerdier) => Promise<void> | void;
};

const AREAS: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const UKEDAG_KORT = ["MA", "TI", "ON", "TO", "FR", "LØ", "SØ"];
// rrule bruker MO,TU,WE,TH,FR,SA,SU — map til 0..6
const RRULE_WEEKDAYS = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];

function byggRrule(input: {
  frekvens: "DAILY" | "WEEKLY" | "MONTHLY";
  intervall: number;
  ukedager: number[];
  startDato: Date | null;
  sluttDato: Date | null;
}): string {
  if (!input.startDato) return "";
  const freq =
    input.frekvens === "DAILY"
      ? Frequency.DAILY
      : input.frekvens === "WEEKLY"
      ? Frequency.WEEKLY
      : Frequency.MONTHLY;
  const rule = new RRule({
    freq,
    interval: Math.max(1, input.intervall),
    dtstart: input.startDato,
    until: input.sluttDato ?? undefined,
    byweekday:
      input.frekvens === "WEEKLY" && input.ukedager.length > 0
        ? input.ukedager.map((d) => RRULE_WEEKDAYS[d])
        : undefined,
  });
  return rule.toString();
}

export function RecurringPatternEditor({ apen, studentId, initial, onLukk, onLagre }: Props) {
  const [navn, setNavn] = useState(initial?.navn ?? "");
  const [pyramide, setPyramide] = useState<PyramidArea>(initial?.pyramide ?? "TEK");
  const [frekvens, setFrekvens] = useState<"DAILY" | "WEEKLY" | "MONTHLY">(
    initial?.frekvens ?? "WEEKLY",
  );
  const [intervall, setIntervall] = useState(initial?.intervall ?? 1);
  const [ukedager, setUkedager] = useState<number[]>(initial?.ukedager ?? [0]);
  const [startDato, setStartDato] = useState<Date | null>(initial?.startDato ?? null);
  const [sluttDato, setSluttDato] = useState<Date | null>(initial?.sluttDato ?? null);
  const [startTid, setStartTid] = useState(initial?.startTid ?? "16:00");
  const [varighetMin, setVarighetMin] = useState(initial?.varighetMin ?? 60);
  const [beskrivelse, setBeskrivelse] = useState(initial?.beskrivelse ?? "");
  const [rrule, setRrule] = useState("");
  const [lagrer, setLagrer] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const r = byggRrule({ frekvens, intervall, ukedager, startDato, sluttDato });
    setRrule(r);
  }, [frekvens, intervall, ukedager, startDato, sluttDato]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!apen) return null;

  const gyldig = navn.length > 0 && startDato !== null && rrule.length > 0;

  function toggleUkedag(d: number) {
    setUkedager((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  }

  async function handleLagre() {
    if (!gyldig) return;
    setLagrer(true);
    try {
      await onLagre({
        navn,
        pyramide,
        frekvens,
        intervall,
        ukedager,
        startDato,
        sluttDato,
        startTid,
        varighetMin,
        beskrivelse,
        rrule,
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
            <h2 className="font-display text-2xl text-foreground">Gjentakende mønster</h2>
            <p className="text-xs text-muted-foreground">Lager rrule som generator bruker</p>
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
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Navn
            </label>
            <input
              type="text"
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              placeholder="f.eks. Putting-rutine"
              className="h-10 w-full rounded-md border border-input bg-card px-4 text-sm focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
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
                Frekvens
              </label>
              <select
                value={frekvens}
                onChange={(e) =>
                  setFrekvens(e.target.value as "DAILY" | "WEEKLY" | "MONTHLY")
                }
                className="h-10 w-full rounded-md border border-input bg-card px-2 text-sm focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                <option value="DAILY">Daglig</option>
                <option value="WEEKLY">Ukentlig</option>
                <option value="MONTHLY">Månedlig</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Intervall
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={intervall}
                onChange={(e) => setIntervall(Math.max(1, Number(e.target.value) || 1))}
                className="h-10 w-full rounded-md border border-input bg-card px-4 font-mono text-sm tabular-nums focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>
          </div>

          {frekvens === "WEEKLY" && (
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ukedager
              </label>
              <div className="flex gap-2">
                {UKEDAG_KORT.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleUkedag(i)}
                    className={cn(
                      "h-10 w-10 rounded-md border text-xs font-medium",
                      ukedager.includes(i)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-foreground",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Start
              </label>
              <SmartDateInput spilllerId={studentId} onChange={(d) => setStartDato(d)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Slutt (valgfritt)
              </label>
              <SmartDateInput spilllerId={studentId} onChange={(d) => setSluttDato(d)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tidspunkt
              </label>
              <input
                type="time"
                value={startTid}
                onChange={(e) => setStartTid(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-card px-4 font-mono text-sm tabular-nums focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Varighet (min)
              </label>
              <input
                type="number"
                min={15}
                max={300}
                step={15}
                value={varighetMin}
                onChange={(e) => setVarighetMin(Math.max(15, Number(e.target.value) || 15))}
                className="h-10 w-full rounded-md border border-input bg-card px-4 font-mono text-sm tabular-nums focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Beskrivelse
            </label>
            <textarea
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="rounded-md bg-secondary/40 p-4">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Generert rrule
            </span>
            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[11px] text-foreground">
              {rrule || "(velg start-dato for å generere)"}
            </pre>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border bg-card px-6 py-2">
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
