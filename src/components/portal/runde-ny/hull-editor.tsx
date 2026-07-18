"use client";

/**
 * HullEditor — delt hull-for-hull-editor for runde-logging (RundeNyForm) og
 * redigering (HullRedigerForm på runde-detaljen). D6a, 17. juli 2026.
 *
 * Brutto score per hull: par (3/4/5 — trykk for å bla), slag (−/+), og
 * VALGFRIE detaljer — putter, fairway-treff (skjult på par 3) og GIR — som
 * tri-state «ikke logget / ja / nei». Ingen fabrikkerte tall: detaljene
 * starter som «ikke logget» (null) og lagres kun når spilleren setter dem.
 *
 * Samme visuelle idiom som runde-ny-form (rå tailwind mot DS-tokens, lucide).
 */

import { Check, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type HullVerdi = {
  /** Hullnummer 1–18 (kan være et delvis utvalg for delvise runder). */
  nr: number;
  par: number;
  strokes: number;
  putts: number | null;
  fairway: boolean | null;
  gir: boolean | null;
};

export const MIN_SLAG = 1;
export const MAX_SLAG = 15;
const MAX_PUTTER = 10;

/** Birdie/par/bogey/dobbel+ — fasitens fargekoding (kun tekstfarge). */
export function scoreTextClass(diff: number): string {
  if (diff <= -1) return "text-success";
  if (diff === 0) return "text-foreground";
  if (diff === 1) return "text-warning";
  return "text-destructive";
}

export function tilParLabel(diff: number): string {
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
}

/** Ferske hull fra en par-liste — score starter på par, detaljer u-logget. */
export function nyeHull(pars: number[], forsteNr = 1): HullVerdi[] {
  return pars.map((par, i) => ({
    nr: forsteNr + i,
    par,
    strokes: par,
    putts: null,
    fairway: null,
    gir: null,
  }));
}

export function summerHull(hull: HullVerdi[]): { score: number; par: number } {
  return {
    score: hull.reduce((s, h) => s + h.strokes, 0),
    par: hull.reduce((s, h) => s + h.par, 0),
  };
}

/* ── Sub-komponenter ──────────────────────────────────────────── */

function GruppeLabel({
  title,
  parTotal,
  scoreTotal,
}: {
  title: string;
  parTotal: number;
  scoreTotal: number;
}) {
  return (
    <div className="mb-2 mt-4 flex items-baseline justify-between">
      <span className="font-mono text-[10px] font-extrabold tracking-[0.10em] text-foreground">
        {title}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
        Par {parTotal} ·{" "}
        <b className="font-extrabold text-foreground">{scoreTotal}</b>
      </span>
    </div>
  );
}

/** Tri-state-chip: null («—») → ja (hake) → nei (kryss) → null. */
function TriChip({
  label,
  verdi,
  hullNr,
  onClick,
}: {
  label: string;
  verdi: boolean | null;
  hullNr: number;
  onClick: () => void;
}) {
  const Ikon = verdi === true ? Check : verdi === false ? X : Minus;
  const status =
    verdi === true ? "ja" : verdi === false ? "nei" : "ikke logget";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} hull ${hullNr}: ${status} — trykk for å endre`}
      className={cn(
        "inline-flex h-6 min-w-0 flex-1 items-center justify-center gap-1 rounded-md border font-mono text-[9px] font-bold uppercase tracking-[0.06em] transition-colors",
        verdi === true && "border-success/40 bg-success/10 text-success",
        verdi === false &&
          "border-destructive/40 bg-destructive/10 text-destructive",
        verdi == null && "border-border bg-background text-muted-foreground",
      )}
    >
      {label}
      <Ikon className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
    </button>
  );
}

const miniKnappCls =
  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors active:bg-secondary disabled:pointer-events-none disabled:opacity-35";

function HullCelle({
  hull,
  visDetaljer,
  onEndre,
}: {
  hull: HullVerdi;
  visDetaljer: boolean;
  onEndre: (nr: number, patch: Partial<HullVerdi>) => void;
}) {
  const d = hull.strokes - hull.par;
  const maxPutter = Math.min(MAX_PUTTER, hull.strokes);

  function blaPar() {
    const nyPar = hull.par >= 5 ? 3 : hull.par + 1;
    // Par 3 har ingen fairway — nullstill FW-loggen når hullet blir par 3.
    onEndre(hull.nr, nyPar === 3 ? { par: nyPar, fairway: null } : { par: nyPar });
  }

  function stegSlag(delta: number) {
    const nye = Math.max(MIN_SLAG, Math.min(MAX_SLAG, hull.strokes + delta));
    const patch: Partial<HullVerdi> = { strokes: nye };
    // Putter kan aldri overstige slag — klem ned når scoren senkes.
    if (hull.putts != null && hull.putts > nye) patch.putts = nye;
    onEndre(hull.nr, patch);
  }

  function stegPutter(delta: number) {
    // «Ikke logget» (null) → + starter på 2 (vanligste verdi); − under 0 → null.
    if (hull.putts == null) {
      if (delta > 0) onEndre(hull.nr, { putts: Math.min(2, maxPutter) });
      return;
    }
    const nye = hull.putts + delta;
    if (nye < 0) onEndre(hull.nr, { putts: null });
    else onEndre(hull.nr, { putts: Math.min(maxPutter, nye) });
  }

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-1.5 py-2">
      <button
        type="button"
        onClick={blaPar}
        aria-label={`Hull ${hull.nr}, par ${hull.par} — trykk for å endre par`}
        className="whitespace-nowrap rounded-md px-1 font-mono text-[9px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        {hull.nr} · par {hull.par}
      </button>
      <span
        className={cn(
          "font-mono text-[22px] font-extrabold leading-none tracking-[-0.03em] tabular-nums",
          scoreTextClass(d),
        )}
      >
        {hull.strokes}
      </span>
      <div className="grid w-full grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => stegSlag(-1)}
          disabled={hull.strokes <= MIN_SLAG}
          aria-label={`Trekk fra hull ${hull.nr}`}
          className="inline-flex h-[34px] items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors active:bg-secondary disabled:pointer-events-none disabled:opacity-35"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => stegSlag(1)}
          disabled={hull.strokes >= MAX_SLAG}
          aria-label={`Legg til hull ${hull.nr}`}
          className="inline-flex h-[34px] items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors active:bg-secondary disabled:pointer-events-none disabled:opacity-35"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      {visDetaljer && (
        <div className="mt-0.5 flex w-full flex-col gap-1.5 border-t border-border pt-1.5">
          {/* Putter — valgfri, «—» betyr ikke logget */}
          <div className="flex w-full items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => stegPutter(-1)}
              disabled={hull.putts == null}
              aria-label={`Færre putter hull ${hull.nr}`}
              className={miniKnappCls}
            >
              <Minus className="h-3 w-3" strokeWidth={1.5} aria-hidden />
            </button>
            <span className="font-mono text-[11px] font-bold tabular-nums text-foreground">
              {hull.putts == null ? "—" : hull.putts}{" "}
              <span className="text-[8px] font-normal uppercase text-muted-foreground">
                putt
              </span>
            </span>
            <button
              type="button"
              onClick={() => stegPutter(1)}
              disabled={hull.putts != null && hull.putts >= maxPutter}
              aria-label={`Flere putter hull ${hull.nr}`}
              className={miniKnappCls}
            >
              <Plus className="h-3 w-3" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
          {/* Fairway (kun par 4/5) + GIR */}
          <div className="flex w-full gap-1">
            {hull.par > 3 && (
              <TriChip
                label="FW"
                verdi={hull.fairway}
                hullNr={hull.nr}
                onClick={() =>
                  onEndre(hull.nr, {
                    fairway:
                      hull.fairway == null ? true : hull.fairway ? false : null,
                  })
                }
              />
            )}
            <TriChip
              label="GIR"
              verdi={hull.gir}
              hullNr={hull.nr}
              onClick={() =>
                onEndre(hull.nr, {
                  gir: hull.gir == null ? true : hull.gir ? false : null,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Editor ───────────────────────────────────────────────────── */

export function HullEditor({
  hull,
  visDetaljer,
  onEndre,
}: {
  hull: HullVerdi[];
  visDetaljer: boolean;
  onEndre: (nr: number, patch: Partial<HullVerdi>) => void;
}) {
  const ut = hull.filter((h) => h.nr <= 9);
  const inn = hull.filter((h) => h.nr > 9);

  const grupper: Array<{ title: string; hull: HullVerdi[] }> = [];
  if (ut.length > 0)
    grupper.push({ title: inn.length > 0 ? "UT · 1–9" : "HULL", hull: ut });
  if (inn.length > 0) grupper.push({ title: "INN · 10–18", hull: inn });

  return (
    <div>
      {grupper.map((g) => {
        const sum = summerHull(g.hull);
        return (
          <div key={g.title}>
            <GruppeLabel
              title={g.title}
              parTotal={sum.par}
              scoreTotal={sum.score}
            />
            <div className="grid grid-cols-3 gap-2 md:grid-cols-6 lg:grid-cols-9">
              {g.hull.map((h) => (
                <HullCelle
                  key={h.nr}
                  hull={h}
                  visDetaljer={visDetaljer}
                  onEndre={onEndre}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
