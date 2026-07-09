"use client";

/**
 * Effekt-tab — viser tidslinje av spillerens fullførte planer med
 * PlanEffectiveness-data. Coach kan registrere selfRating/coachRating + notater
 * per plan via `rateEffectiveness` server action.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Activity,
  Loader2,
  Save,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { rateEffectiveness } from "@/app/admin/(legacy)/plans/[planId]/actions";

export type EffektRad = {
  id: string;
  planId: string;
  planName: string;
  templateId: string | null;
  templateName: string | null;
  periode: string;
  computedAt: string;
  completionRate: number;
  sgTotalDelta: number | null;
  sgOttDelta: number | null;
  sgAppDelta: number | null;
  sgArgDelta: number | null;
  sgPuttDelta: number | null;
  selfRating: number | null;
  coachRating: number | null;
  notes: string | null;
};

function formatDelta(v: number | null): string {
  if (v === null) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2).replace(".", ",")}`;
}

function deltaKlasse(v: number | null): string {
  if (v === null) return "text-muted-foreground";
  if (v > 0.05) return "text-primary";
  if (v < -0.05) return "text-destructive";
  return "text-muted-foreground";
}

export function EffektTab({ rader }: { rader: EffektRad[] }) {
  if (rader.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <Activity
          className="mx-auto mb-4 h-8 w-8 text-muted-foreground"
          strokeWidth={1.5}
        />
        <h2 className="font-display text-[18px] font-semibold">
          Ingen fullførte planer ennå
        </h2>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Når spilleren fullfører en treningsplan beregnes pre/post SG-deltas
          automatisk og vises her.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {rader.map((r) => (
        <EffektKort key={r.id} rad={r} />
      ))}
    </section>
  );
}

function EffektKort({ rad }: { rad: EffektRad }) {
  const [self, setSelf] = useState<string>(
    rad.selfRating !== null ? String(rad.selfRating) : "",
  );
  const [coach, setCoach] = useState<string>(
    rad.coachRating !== null ? String(rad.coachRating) : "",
  );
  const [notes, setNotes] = useState<string>(rad.notes ?? "");
  const [feil, setFeil] = useState<string | null>(null);
  const [lagretTs, setLagretTs] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function tilNumber(s: string): number | null {
    const trimmet = s.trim().replace(",", ".");
    if (trimmet === "") return null;
    const n = Number(trimmet);
    if (Number.isNaN(n)) return null;
    return n;
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    const selfN = tilNumber(self);
    const coachN = tilNumber(coach);
    if (selfN !== null && (selfN < 1 || selfN > 5)) {
      setFeil("Spillerens rating må være 1–5.");
      return;
    }
    if (coachN !== null && (coachN < 1 || coachN > 5)) {
      setFeil("Coachens rating må være 1–5.");
      return;
    }

    startTransition(async () => {
      const res = await rateEffectiveness({
        effectivenessId: rad.id,
        selfRating: selfN,
        coachRating: coachN,
        notes,
      });
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      setLagretTs(Date.now());
    });
  }

  const sgTotalTone = deltaKlasse(rad.sgTotalDelta);
  const TotalIkon =
    rad.sgTotalDelta === null
      ? null
      : rad.sgTotalDelta >= 0
        ? TrendingUp
        : TrendingDown;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <Link
            href={`/admin/plans/${rad.planId}`}
            className="font-display text-[16px] font-semibold leading-tight hover:underline"
          >
            {rad.planName}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span>{rad.periode}</span>
            {rad.templateName && (
              <>
                <span aria-hidden>·</span>
                <Link
                  href={`/admin/plan-templates/${rad.templateId}/effectiveness`}
                  className="hover:text-foreground hover:underline"
                >
                  Mal: {rad.templateName}
                </Link>
              </>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-2 font-mono text-[18px] font-semibold tabular-nums ${sgTotalTone}`}>
          {TotalIkon && <TotalIkon className="h-4 w-4" strokeWidth={1.5} />}
          {formatDelta(rad.sgTotalDelta)}
          <span className="font-sans text-[11px] font-normal text-muted-foreground">
            SG-Total
          </span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 px-6 py-2 sm:grid-cols-5">
        <SgCell label="OTT" v={rad.sgOttDelta} />
        <SgCell label="APP" v={rad.sgAppDelta} />
        <SgCell label="ARG" v={rad.sgArgDelta} />
        <SgCell label="PUTT" v={rad.sgPuttDelta} />
        <SgCell
          label="Completion"
          v={null}
          override={`${Math.round(rad.completionRate * 100)} %`}
        />
      </div>

      <form
        onSubmit={lagre}
        className="space-y-2 border-t border-border bg-background/40 px-6 py-4"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <RatingFelt
            label="Spillerens egen rating (1–5)"
            value={self}
            onChange={setSelf}
          />
          <RatingFelt
            label="Coachens rating (1–5)"
            value={coach}
            onChange={setCoach}
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Notater — hva virket / virket ikke
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Putting forbedret seg merkbart. Reduser nærspill og øk APP neste plan."
            className="w-full resize-y rounded-md border border-input bg-card px-4 py-2 text-[13px] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
        </div>

        {feil && (
          <p className="text-[12px] text-destructive">{feil}</p>
        )}
        {lagretTs !== null && (
          <p className="text-[12px] text-primary">Lagret.</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <Save className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            Lagre vurdering
          </button>
        </div>
      </form>
    </article>
  );
}

function SgCell({
  label,
  v,
  override,
}: {
  label: string;
  v: number | null;
  override?: string;
}) {
  const tone = override ? "text-foreground" : deltaKlasse(v);
  return (
    <div className="rounded-md bg-card px-4 py-2">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-[14px] font-semibold tabular-nums ${tone}`}
      >
        {override ?? formatDelta(v)}
      </div>
    </div>
  );
}

function RatingFelt({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="4,0"
        className="w-full rounded-md border border-input bg-card px-4 py-2 font-mono text-[13px] tabular-nums focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
