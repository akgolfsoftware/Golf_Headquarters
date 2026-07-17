"use client";

/**
 * HullRedigerForm — «Rediger hull-for-hull» på runde-detaljen (D6a, 17. juli
 * 2026). Gjenbruker HullEditor fra logge-flyten; lagrer via lagreHullScorer
 * (upsert på @@unique(roundId, holeNumber)). Kun rundens eier (håndheves i
 * action). Brutto score — totalen auto-summeres fra hullene.
 *
 * Runder logget uten hulldata: spilleren velger 9/18 hull og bygger score-
 * kortet fra par-malen. Delvise runder (annet antall hull, fra slag-føring)
 * redigeres som de er — antallet låses for å ikke fabrikkere hull.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { lagreHullScorer } from "@/app/portal/mal/runder/[id]/actions";
import { parTemplate } from "@/lib/portal-runder/par-template";
import {
  HullEditor,
  nyeHull,
  summerHull,
  scoreTextClass,
  tilParLabel,
  type HullVerdi,
} from "./hull-editor";

const segmentCls = (aktiv: boolean) =>
  cn(
    "h-9 rounded-lg px-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-colors",
    aktiv
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-secondary",
  );

export function HullRedigerForm({
  roundId,
  coursePar,
  initial,
}: {
  roundId: string;
  coursePar: number;
  initial: HullVerdi[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [hull, setHull] = useState<HullVerdi[]>(initial);
  const [visDetaljer, setVisDetaljer] = useState(() =>
    initial.some((h) => h.putts != null || h.fairway != null || h.gir != null),
  );

  // 9/18-valget vises kun når det ikke fabrikkerer hull: tomt scorekort
  // (nytt) eller standard 9/18. Delvise runder beholder sine hull.
  const kanVelgeAntall =
    initial.length === 0 || initial.length === 9 || initial.length === 18;

  function velgAntall(n: 9 | 18) {
    const pars = parTemplate(coursePar);
    setHull((prev) =>
      n === 9
        ? prev.filter((h) => h.nr <= 9)
        : [
            ...prev.filter((h) => h.nr <= 9),
            ...(prev.some((h) => h.nr > 9)
              ? prev.filter((h) => h.nr > 9)
              : nyeHull(pars.slice(9), 10)),
          ],
    );
  }

  function endreHull(nr: number, patch: Partial<HullVerdi>) {
    setHull((prev) => prev.map((h) => (h.nr === nr ? { ...h, ...patch } : h)));
  }

  const sum = summerHull(hull);
  const diff = sum.score - sum.par;
  const harHull = hull.length > 0;

  function lagre() {
    if (!harHull) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await lagreHullScorer(
          roundId,
          hull.map((h) => ({
            holeNumber: h.nr,
            par: h.par,
            strokes: h.strokes,
            putts: h.putts,
            fairway: h.fairway,
            gir: h.gir,
          })),
        );
        if (res.ok) {
          router.push(`/portal/mal/runder/${roundId}`);
          router.refresh();
        } else {
          setError(res.error ?? "Kunne ikke lagre. Prøv igjen.");
        }
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  // Nytt scorekort: velg antall hull først.
  if (!harHull) {
    return (
      <div className="mt-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Denne runden er logget uten hulldata. Hvor mange hull spilte du?
        </p>
        <div className="flex gap-2">
          {([9, 18] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setHull(nyeHull(parTemplate(coursePar).slice(0, n)))}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-secondary"
            >
              {n} hull
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* 9/18 + detalj-toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {kanVelgeAntall && (
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => velgAntall(9)}
              aria-pressed={hull.length <= 9}
              className={segmentCls(hull.length <= 9)}
            >
              9 hull
            </button>
            <button
              type="button"
              onClick={() => velgAntall(18)}
              aria-pressed={hull.length > 9}
              className={segmentCls(hull.length > 9)}
            >
              18 hull
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setVisDetaljer((v) => !v)}
          aria-pressed={visDetaljer}
          className={cn(
            "h-9 rounded-xl border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-colors",
            visDetaljer
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:bg-secondary",
          )}
        >
          Putter · FW · GIR · valgfritt
        </button>
      </div>

      {/* LIVE to-par — brutto sum av hullene */}
      <div className="mt-4 flex items-center gap-3.5 rounded-xl border border-border border-l-[3px] border-l-accent bg-card px-4 py-3.5">
        <span
          className={cn(
            "font-mono text-[30px] font-extrabold leading-none tracking-[-0.03em] tabular-nums",
            scoreTextClass(diff),
          )}
        >
          {tilParLabel(diff)}
        </span>
        <div className="flex-1">
          <div className="font-mono text-base font-extrabold tabular-nums text-foreground">
            {sum.score} slag
          </div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            Par {sum.par} · {hull.length} hull
          </div>
        </div>
      </div>

      <HullEditor hull={hull} visDetaljer={visDetaljer} onEndre={endreHull} />

      {error && (
        <div
          role="alert"
          className="mb-2 mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={lagre}
        disabled={pending}
        className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-primary-foreground shadow-[0_8px_20px_rgba(0,88,64,0.18)] transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
      >
        <Check className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        {pending ? "Lagrer…" : "Lagre scorekortet"}
      </button>
    </div>
  );
}
