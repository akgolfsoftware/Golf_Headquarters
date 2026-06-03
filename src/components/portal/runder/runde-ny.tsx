"use client";

/**
 * PlayerHQ · Runder · Legg til runde — mobil-first score-input (presentasjonell).
 *
 * Pixel-port av design-fasit:
 *   public/design-handover/_screens/pl-runde-ny.png
 *   public/design-handover/playerhq/components-runde-ny.html
 *
 * Mobil-optimal (≤640px = primær fasit): ✕-topbar med tittel + "TRINN 1 AV 1",
 * bane- og dato-felt, score per hull med store ±-steppere (≥ 38px touch-target),
 * live score-til-par som regnes om mens du taster (UT/INN-subtotaler + total,
 * fargekodet birdie/par/bogey/dobbel, «E» = even par). Strokes Gained (4 felt)
 * er valgfritt og nedprioritert. Sticky "Lagre runde"-CTA nederst.
 *
 * Props-drevet og selvstendig: ingen Prisma/DB/auth. Lagring er en valgfri
 * callback (`onSave`) — i preview er den utelatt. DS-tokens kun, ingen hardkodet
 * hex, ingen emoji (kun lucide).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Check, Minus, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_SCORE = 1;
const MAX_SCORE = 12;

const SG_FIELDS = [
  { key: "ott", label: "OTT" },
  { key: "app", label: "APP" },
  { key: "arg", label: "ARG" },
  { key: "putt", label: "PUTT" },
] as const;
type SgKey = (typeof SG_FIELDS)[number]["key"];

export interface RundeNyData {
  /** Banenavn vist i bane-feltet */
  bane: string;
  /** Dato vist i dato-feltet (vis-format, f.eks. "01/06/2026") */
  dato: string;
  /** Par per hull, lengde 18. Front nine = [0..8], back nine = [9..17]. */
  pars: number[];
  /** Startscore per hull, lengde 18. Default = par per hull (E). */
  scores?: number[];
  /** Startverdier for SG-felt (vis-format, f.eks. "+0,32"). Tom = placeholder. */
  sg?: Partial<Record<SgKey, string>>;
  /** Startverdi for notat. Tom = placeholder. */
  notat?: string;
}

export interface RundeNyProps {
  data: RundeNyData;
  /** Hvor ✕ (avbryt) lenker */
  cancelHref?: string;
  /** Valgfri lagre-callback. Utelatt i preview (knapp er da inaktiv-trygg). */
  onSave?: (payload: {
    scores: number[];
    sg: Record<SgKey, string>;
    notat: string;
  }) => void;
}

function holeDiffClass(diff: number): string {
  if (diff <= -1) return "bg-success/10 text-success";
  if (diff === 0) return "text-foreground";
  if (diff === 1) return "bg-warning/15 text-warning-foreground";
  return "bg-destructive/10 text-destructive";
}

function toParLabel(diff: number): string {
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
}

function toParClass(diff: number): string {
  if (diff < 0) return "text-success";
  if (diff > 0) return "text-destructive";
  return "text-foreground";
}

// ── Felles klasse-strenger (matcher fasit-typografi) ──────────────
const labelCls =
  "font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground";
const fieldInpCls =
  "flex h-12 items-center gap-2.5 rounded-xl border border-input bg-card px-3.5 text-[15px] text-foreground transition-colors focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/20";

function SectionHead({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="mb-2.5 mt-1.5 flex items-baseline gap-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
      <span>{children}</span>
      {optional ? <span className="font-bold">· valgfritt</span> : null}
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

function HoleCell({
  hole,
  par,
  score,
  onStep,
}: {
  hole: number;
  par: number;
  score: number;
  onStep: (delta: number) => void;
}) {
  const diff = score - par;
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-2">
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[11px] font-extrabold text-foreground">
          {hole}
        </span>
        <span className="font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
          par {par}
        </span>
      </div>
      <span
        className={cn(
          "flex h-[34px] w-10 items-center justify-center rounded-lg font-mono text-[26px] font-extrabold leading-none tracking-[-0.03em] tabular-nums",
          holeDiffClass(diff),
        )}
      >
        {score}
      </span>
      <div className="grid w-full grid-cols-2 gap-1.5">
        <button
          type="button"
          aria-label={`Hull ${hole}: trekk fra`}
          onClick={() => onStep(-1)}
          disabled={score <= MIN_SCORE}
          className="inline-flex h-[38px] items-center justify-center rounded-lg border border-border bg-secondary/50 text-foreground transition-colors hover:bg-secondary active:bg-secondary disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Minus className="h-[15px] w-[15px]" strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Hull ${hole}: legg til`}
          onClick={() => onStep(1)}
          disabled={score >= MAX_SCORE}
          className="inline-flex h-[38px] items-center justify-center rounded-lg border border-border bg-secondary/50 text-foreground transition-colors hover:bg-secondary active:bg-secondary disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-[15px] w-[15px]" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function RundeNy({ data, cancelHref = "/portal/mal/runder", onSave }: RundeNyProps) {
  const { pars } = data;

  const [scores, setScores] = useState<number[]>(
    () => data.scores?.slice() ?? pars.slice(),
  );
  const [sg, setSg] = useState<Record<SgKey, string>>(() => ({
    ott: data.sg?.ott ?? "",
    app: data.sg?.app ?? "",
    arg: data.sg?.arg ?? "",
    putt: data.sg?.putt ?? "",
  }));
  const [notat, setNotat] = useState(data.notat ?? "");

  // ── Live-beregninger ────────────────────────────────────────────
  const { parOut, parIn, sOut, sIn, total, parTotal, diff } = useMemo(() => {
    const parOut = pars.slice(0, 9).reduce((a, b) => a + b, 0);
    const parIn = pars.slice(9).reduce((a, b) => a + b, 0);
    const sOut = scores.slice(0, 9).reduce((a, b) => a + b, 0);
    const sIn = scores.slice(9).reduce((a, b) => a + b, 0);
    const total = sOut + sIn;
    const parTotal = parOut + parIn;
    return { parOut, parIn, sOut, sIn, total, parTotal, diff: total - parTotal };
  }, [pars, scores]);

  function step(i: number, delta: number) {
    setScores((prev) => {
      const next = prev.slice();
      next[i] = Math.max(MIN_SCORE, Math.min(MAX_SCORE, next[i] + delta));
      return next;
    });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-card">
      {/* Topbar */}
      <div className="flex items-center gap-3 border-b border-border px-[18px] py-3">
        <Link
          href={cancelHref}
          aria-label="Avbryt"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </Link>
        <h2 className="font-display text-[17px] font-bold tracking-[-0.015em] text-foreground">
          Legg til runde
        </h2>
        <span className="ml-auto font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          TRINN 1 AV 1
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 pt-4">
        {/* Bane */}
        <div className="mb-4 flex flex-col gap-1.5">
          <span className={labelCls}>Bane</span>
          <label className={fieldInpCls}>
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              type="text"
              defaultValue={data.bane}
              placeholder="Søk bane…"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        {/* Dato */}
        <div className="mb-4 flex flex-col gap-1.5">
          <span className={labelCls}>Dato</span>
          <label className={fieldInpCls}>
            <Calendar
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              type="text"
              inputMode="numeric"
              defaultValue={data.dato}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[15px] font-bold tabular-nums text-foreground outline-none"
            />
          </label>
        </div>

        <SectionHead>Score per hull</SectionHead>

        {/* Live score-summary */}
        <div className="mb-3.5 flex items-center gap-3.5 rounded-xl border border-border border-l-[3px] border-l-accent bg-card px-4 py-3.5">
          <span
            className={cn(
              "font-mono text-[30px] font-extrabold leading-none tracking-[-0.03em] tabular-nums",
              toParClass(diff),
            )}
          >
            {toParLabel(diff)}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-base font-extrabold tabular-nums text-foreground">
              {total}
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              Slag totalt
            </span>
          </div>
          <div className="ml-auto text-right font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
            <b className="block text-sm font-extrabold text-foreground">
              Par {parTotal}
            </b>
            18 hull
          </div>
        </div>

        {/* UT · 1-9 */}
        <div className="mx-0.5 mb-2 flex items-baseline justify-between">
          <span className="font-mono text-[10px] font-extrabold tracking-[0.10em] text-foreground">
            UT · 1–9
          </span>
          <span className="font-mono text-[11px] font-extrabold tabular-nums text-muted-foreground">
            Par {parOut} · <b className="text-foreground">{sOut}</b>
          </span>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {pars.slice(0, 9).map((par, i) => (
            <HoleCell
              key={i}
              hole={i + 1}
              par={par}
              score={scores[i]}
              onStep={(d) => step(i, d)}
            />
          ))}
        </div>

        {/* INN · 10-18 */}
        <div className="mx-0.5 mb-2 flex items-baseline justify-between">
          <span className="font-mono text-[10px] font-extrabold tracking-[0.10em] text-foreground">
            INN · 10–18
          </span>
          <span className="font-mono text-[11px] font-extrabold tabular-nums text-muted-foreground">
            Par {parIn} · <b className="text-foreground">{sIn}</b>
          </span>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {pars.slice(9).map((par, i) => (
            <HoleCell
              key={i + 9}
              hole={i + 10}
              par={par}
              score={scores[i + 9]}
              onStep={(d) => step(i + 9, d)}
            />
          ))}
        </div>

        {/* Strokes Gained */}
        <SectionHead optional>Strokes Gained</SectionHead>
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          {SG_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] font-extrabold tracking-[0.10em] text-muted-foreground">
                {label}
              </span>
              <span className="flex h-[46px] items-center gap-1.5 rounded-[11px] border border-input bg-card px-2.5 transition-colors focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/20">
                <input
                  type="text"
                  inputMode="decimal"
                  value={sg[key]}
                  onChange={(e) =>
                    setSg((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder="0,00"
                  className="w-full border-0 bg-transparent p-0 font-mono text-[15px] font-bold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/60"
                />
                <span className="font-mono text-[10px] font-bold text-muted-foreground">
                  SG
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Notat */}
        <div className="mb-4 flex flex-col gap-1.5">
          <SectionHead optional>Notat</SectionHead>
          <textarea
            value={notat}
            onChange={(e) => setNotat(e.target.value)}
            placeholder="Beste runden i år, godt på innspill…"
            className="min-h-[72px] w-full resize-none rounded-xl border border-input bg-card px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-ring/20"
          />
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-gradient-to-b from-transparent via-card to-card px-4 pb-[18px] pt-3.5">
        <button
          type="button"
          onClick={() => onSave?.({ scores, sg, notat })}
          className="inline-flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-primary font-mono text-xs font-extrabold uppercase tracking-[0.08em] text-accent shadow-[0_8px_20px_rgba(0,88,64,0.18)] transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Check className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Lagre runde
        </button>
      </div>
    </div>
  );
}
