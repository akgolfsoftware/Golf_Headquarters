"use client";

// QuickAddPopover — rask økt-opprettelse i kalender.
//
// Bruker:
//   - PyramidArea-velger (5 knapper med pyramide-farger)
//   - SmartDateInput for dato
//   - Tid + varighet (number-input)
//   - Beskrivelse (valgfri)

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartDateInput } from "./SmartDateInput";
import { PYRAMIDE } from "@/lib/portal/training/ak-taxonomy";
import type { PyramidArea, PracticeType } from "@/generated/prisma/client";
import { PraksistypeBadge } from "./PraksistypeBadge";

type Props = {
  /** Spiller-id som SmartDateInput bruker for turnerings-ankere. */
  spilllerId?: string;
  /** Default-dato (f.eks. valgt dag i kalender). */
  basisdato?: Date;
  onLagre: (input: {
    title: string;
    pyramide: PyramidArea;
    practiceType: PracticeType;
    dato: Date;
    tid: string;
    varighetMin: number;
    notater: string;
  }) => Promise<void> | void;
  onAvbryt?: () => void;
  className?: string;
};

const PYRAMIDE_KNAPPER: Array<{ key: PyramidArea; bg: string }> = [
  { key: "FYS", bg: "bg-pyr-fys text-white" },
  { key: "TEK", bg: "bg-pyr-tek text-white" },
  { key: "SLAG", bg: "bg-pyr-slag text-foreground" },
  { key: "SPILL", bg: "bg-pyr-spill text-white" },
  { key: "TURN", bg: "bg-pyr-turn text-white" },
];

const PRAKSIS_VALG: PracticeType[] = ["BLOKK", "RANDOM", "KONKURRANSE", "SPILL_TEST"];

export function QuickAddPopover({
  spilllerId,
  basisdato,
  onLagre,
  onAvbryt,
  className,
}: Props) {
  const [title, setTitle] = useState("");
  const [pyramide, setPyramide] = useState<PyramidArea>("TEK");
  const [practiceType, setPracticeType] = useState<PracticeType>("BLOKK");
  const [dato, setDato] = useState<Date | null>(basisdato ?? null);
  const [tid, setTid] = useState("10:00");
  const [varighet, setVarighet] = useState(60);
  const [notater, setNotater] = useState("");
  const [lagrer, setLagrer] = useState(false);

  const kanLagre = dato !== null && title.trim().length > 0;

  async function håndterLagre() {
    if (!dato || !kanLagre) return;
    setLagrer(true);
    try {
      await onLagre({
        title: title.trim(),
        pyramide,
        practiceType,
        dato,
        tid,
        varighetMin: varighet,
        notater: notater.trim(),
      });
    } finally {
      setLagrer(false);
    }
  }

  return (
    <div
      className={cn(
        "flex w-80 flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-lg",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Ny økt</h3>
        {onAvbryt && (
          <button
            type="button"
            onClick={onAvbryt}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground">Tittel</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="f.eks. Putting + nedslagslinje"
          className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-foreground">Pyramide</label>
        <div className="flex gap-1">
          {PYRAMIDE_KNAPPER.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPyramide(p.key)}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-opacity",
                p.bg,
                pyramide === p.key ? "opacity-100 ring-2 ring-ring" : "opacity-50 hover:opacity-80",
              )}
            >
              {PYRAMIDE[p.key].kode}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-foreground">Praksistype</label>
        <div className="flex gap-1.5">
          {PRAKSIS_VALG.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPracticeType(t)}
              className={cn(
                "rounded-full px-2 py-0.5 transition-opacity",
                practiceType === t ? "opacity-100 ring-2 ring-ring" : "opacity-60 hover:opacity-90",
              )}
              aria-label={t}
            >
              <PraksistypeBadge type={t} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground">Dato</label>
        <SmartDateInput
          spilllerId={spilllerId}
          onChange={(d) => setDato(d)}
          placeholder="i morgen, neste mandag, 15. mai"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-foreground">Tid</label>
          <input
            type="time"
            value={tid}
            onChange={(e) => setTid(e.target.value)}
            className="h-10 rounded-md border border-input bg-card px-3 text-sm tabular-nums text-foreground"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-foreground">Varighet (min)</label>
          <input
            type="number"
            min={5}
            max={600}
            step={5}
            value={varighet}
            onChange={(e) => setVarighet(Number(e.target.value))}
            className="h-10 rounded-md border border-input bg-card px-3 text-sm tabular-nums text-foreground"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground">Notater</label>
        <textarea
          value={notater}
          onChange={(e) => setNotater(e.target.value)}
          rows={2}
          placeholder="Valgfritt"
          className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onAvbryt && (
          <button
            type="button"
            onClick={onAvbryt}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Avbryt
          </button>
        )}
        <button
          type="button"
          disabled={!kanLagre || lagrer}
          onClick={håndterLagre}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity",
            (!kanLagre || lagrer) && "opacity-50",
          )}
        >
          <Plus size={14} strokeWidth={1.5} />
          {lagrer ? "Lagrer…" : "Lagre"}
        </button>
      </div>
    </div>
  );
}
