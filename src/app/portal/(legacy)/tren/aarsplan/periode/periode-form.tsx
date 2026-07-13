"use client";

/**
 * Delt periode-skjema for både `/periode/ny` og `/periode/[id]/rediger`.
 * Kun de faktiske PeriodBlock-feltene (lPhase, datoer, ukevolum, fokus, notater) —
 * ingen felt som ikke persisteres i skjemaet (tidligere versjon hadde
 * farge/SG-fokus/mål/slidere som ble tystet bort ved lagring).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { useTilbake } from "@/components/v2/back-button";
import type { LPhase } from "@/generated/prisma/client";
import { PeriodeConstraintBadges } from "@/components/portal/periode-constraint-badges";
import { CANON_PERIOD_ADJUSTMENT } from "@/lib/workbench/canon-period-adjustment";
import { opprettPeriode, oppdaterPeriode, slettPeriode } from "./actions";

/** «CANON anbefaler: FYS opp · SPILL ned» — kun retninger som faktisk avviker fra «lik». */
function canonHintFor(lPhase: LPhase): string | null {
  const retninger = CANON_PERIOD_ADJUSTMENT[lPhase];
  const deler = Object.entries(retninger)
    .filter(([, retning]) => retning !== "lik")
    .map(([area, retning]) => `${area} ${retning}`);
  return deler.length > 0 ? `CANON anbefaler: ${deler.join(" · ")}` : null;
}

const LPHASE_META: Record<LPhase, { label: string; color: string }> = {
  GRUNN: { label: "Grunnperiode", color: "bg-emerald-600" },
  SPESIAL: { label: "Spesialiseringsperiode", color: "bg-teal-600" },
  TURNERING: { label: "Turneringsperiode", color: "bg-amber-500" },
  TESTUKE: { label: "Testuke", color: "bg-sky-600" },
  FERIE: { label: "Ferie", color: "bg-zinc-500" },
  TRENINGSSAMLING: { label: "Treningssamling", color: "bg-blue-600" },
  HELDAGSSAMLING: { label: "Heldagssamling", color: "bg-lime-600" },
};
const LPHASE_ORDER: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING", "TESTUKE", "FERIE", "TRENINGSSAMLING", "HELDAGSSAMLING"];

export type PeriodeFormInitial = {
  lPhase: LPhase;
  startDate: string;
  endDate: string;
  focus: string | null;
  notes: string | null;
  weeklyVolMin: number | null;
  weeklyVolMax: number | null;
};

type Props =
  | { mode: "ny"; seasonPlanId: string; periodeId?: undefined; initial?: undefined }
  | { mode: "rediger"; seasonPlanId?: undefined; periodeId: string; initial: PeriodeFormInitial };

export function PeriodeForm(props: Props) {
  const router = useRouter();
  const tilbake = useTilbake("/portal/tren/aarsplan");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const initial = props.mode === "rediger" ? props.initial : undefined;
  const [lPhase, setLPhase] = useState<LPhase>(initial?.lPhase ?? "GRUNN");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [focus, setFocus] = useState(initial?.focus ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [volMin, setVolMin] = useState(initial?.weeklyVolMin?.toString() ?? "");
  const [volMax, setVolMax] = useState(initial?.weeklyVolMax?.toString() ?? "");

  function lagre() {
    setError(null);
    setWarnings([]);
    startTransition(async () => {
      const felles = {
        lPhase,
        startDate,
        endDate,
        focus: focus.trim() || null,
        notes: notes.trim() || null,
        weeklyVolMin: volMin.trim() ? Number(volMin) : null,
        weeklyVolMax: volMax.trim() ? Number(volMax) : null,
      };
      const res =
        props.mode === "ny"
          ? await opprettPeriode({ seasonPlanId: props.seasonPlanId, ...felles })
          : await oppdaterPeriode({ id: props.periodeId, ...felles });
      if (!res.ok) {
        setError(res.error ?? "Kunne ikke lagre perioden.");
        return;
      }
      if (res.warnings?.length) setWarnings(res.warnings);
      router.push("/portal/tren/aarsplan");
      router.refresh();
    });
  }

  function slett() {
    if (props.mode !== "rediger") return;
    if (!confirm("Slette denne perioden? Dette kan ikke angres.")) return;
    startTransition(async () => {
      const res = await slettPeriode(props.periodeId);
      if (!res.ok) {
        setError(res.error ?? "Kunne ikke slette periode.");
        return;
      }
      router.push("/portal/tren/aarsplan");
      router.refresh();
    });
  }

  return (
    <>
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            01
          </span>
          <h2 className="font-display text-base font-semibold tracking-tight">Periodetype</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {LPHASE_ORDER.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setLPhase(p)}
              className={`rounded-full px-4 py-1.5 font-mono text-[11px] font-semibold transition-all ${
                lPhase === p
                  ? `${LPHASE_META[p].color} text-white`
                  : "border border-border bg-card text-muted-foreground hover:border-foreground/20"
              }`}
            >
              {LPHASE_META[p].label}
            </button>
          ))}
        </div>
        <PeriodeConstraintBadges lPhase={lPhase} />
        {canonHintFor(lPhase) && (
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary">
            {canonHintFor(lPhase)}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Startdato" required>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </Field>
          <Field label="Sluttdato" required>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            02
          </span>
          <h2 className="font-display text-base font-semibold tracking-tight">Volum og fokus</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Min. min/uke">
            <input
              type="number"
              min={0}
              value={volMin}
              onChange={(e) => setVolMin(e.target.value)}
              placeholder="60"
              className={`${inputCls} tabular-nums`}
            />
          </Field>
          <Field label="Maks min/uke">
            <input
              type="number"
              min={0}
              value={volMax}
              onChange={(e) => setVolMax(e.target.value)}
              placeholder="360"
              className={`${inputCls} tabular-nums`}
            />
          </Field>
        </div>
        <Field label="Fokus (valgfritt)">
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder={`f.eks. «Putting + nærspill»`}
            className={inputCls}
          />
        </Field>
        <Field label="Notater (valgfritt)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className={inputCls}
          />
        </Field>
      </section>

      {warnings.length > 0 && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-700">
          <p className="font-semibold">Merk (dette er kun en anbefaling — perioden er lagret):</p>
          <ul className="mt-1 list-disc pl-4">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <footer
        className="sticky bottom-0 -mx-4 mt-4 flex flex-wrap items-center gap-2 border-t border-border bg-card/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
      >
        {props.mode === "rediger" && (
          <button
            type="button"
            onClick={slett}
            disabled={pending}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={12} strokeWidth={1.75} /> Slett periode
          </button>
        )}
        <div className="ml-auto flex flex-1 justify-end gap-2 sm:flex-initial">
          <button
            type="button"
            onClick={tilbake}
            disabled={pending}
            className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={lagre}
            disabled={pending || !startDate || !endDate}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Check size={14} strokeWidth={2} />
            {pending ? "Lagrer…" : "Lagre periode"}
          </button>
        </div>
      </footer>
    </>
  );
}

const inputCls =
  "w-full min-h-11 rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
