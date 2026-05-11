/**
 * PILOT — EditPlan (hurtig-edit modal)
 * URL: /editplan-demo
 * Bygd fra wireframe/design-files-v2/modaler-A/05-editplan.html
 */

import Link from "next/link";
import { Calendar, Check, ChevronDown, Edit3, Lock, X } from "lucide-react";

export default function EditPlanDemo() {
  return (
    <div className="min-h-screen bg-[var(--surface,#FAFAF7)]">
      <div className="fixed inset-0 bg-[rgba(10,31,24,0.5)]" aria-hidden="true" />

      <div className="relative mx-auto my-8 max-w-[720px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 py-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <Edit3 className="h-3 w-3" strokeWidth={1.75} />
              CoachHQ · plan-detalj · endre
            </div>
            <h2 className="mt-1 font-display text-[22px] font-bold leading-tight tracking-tight">
              Endre plan
            </h2>
            <p className="mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
              Hurtig-edit av plan-meta. Større endringer i pyramide eller økter? Bruk full
              plan-builder.
            </p>
          </div>
          <Link
            href="/"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </Link>
        </header>

        {/* Body */}
        <div className="flex max-h-[calc(100vh-220px)] flex-col gap-5 overflow-y-auto px-8 py-6">
          {/* Plan-navn */}
          <Field
            label="Plan-navn"
            required
            counter="21 / 80"
          >
            <input
              type="text"
              defaultValue="Sommer-toppform 2026"
              className="w-full rounded-lg border-2 border-border bg-[var(--surface,#FAFAF7)] px-4 py-2.5 text-[14px] text-foreground outline-none transition-colors focus:border-primary"
            />
          </Field>

          {/* Coach */}
          <Field label="Coach (ansvarlig)">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border-2 border-border bg-[var(--surface,#FAFAF7)] px-4 py-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-semibold text-accent">
                AK
              </span>
              <span className="text-[14px] font-semibold text-foreground">
                Anders Kristiansen{" "}
                <span className="font-mono text-[11px] font-medium text-muted-foreground">
                  · NGF Trener IV
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            </div>
          </Field>

          {/* Spiller (låst) */}
          <Field label="Spiller">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-border bg-[var(--surface,#FAFAF7)] px-4 py-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                MP
              </span>
              <div>
                <span className="block text-[14px] font-semibold text-foreground">
                  Markus Roinås Pedersen
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  HCP 12,4 · Kat A · 16 år
                </span>
              </div>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3 w-3" strokeWidth={2} />
                låst
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Spilleren på en aktiv plan kan ikke endres. Arkiver og lag ny plan om nødvendig.
            </p>
          </Field>

          {/* Periode */}
          <Field label="Periode" required help="8 uker · 53 dager · 32 økter">
            <div className="grid grid-cols-2 gap-3">
              <DateField value="9. mai 2026" />
              <DateField value="30. juni 2026" />
            </div>
          </Field>

          {/* Status (segmented control) */}
          <Field label="Status">
            <div className="flex gap-0.5 rounded-xl border border-border bg-[var(--surface-alt,#F1EEE5)] p-1">
              <SegBtn active dotColor="var(--status-success,#1A7D56)" label="Aktiv" />
              <SegBtn dotColor="#D4942E" label="Pause" />
              <SegBtn dotColor="var(--ink-subtle,#9D9C95)" label="Arkivert" />
            </div>
          </Field>

          {/* Tags */}
          <Field label="Tags" counter="2 valgt">
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border-2 border-border bg-[var(--surface,#FAFAF7)] px-3 py-2.5">
              <TagChip label="Sørlandsåpent" />
              <TagChip label="Turnerings-fokus" />
              <input
                type="text"
                placeholder="Legg til tag …"
                className="min-w-[100px] flex-1 border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </Field>

          {/* Notater */}
          <Field label="Notater (intern — ikke synlig for spiller)">
            <textarea
              className="min-h-[92px] w-full resize-y rounded-lg border-2 border-border bg-[var(--surface,#FAFAF7)] px-4 py-2.5 text-[14px] leading-[1.5] text-foreground outline-none transition-colors focus:border-primary"
              defaultValue="Markus er motivert, men har lett for å overtrene siste uka før turnering. Hold pause-uke 23 fast."
            />
          </Field>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-[var(--surface-alt,#F1EEE5)] px-8 py-4">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            Avbryt
          </Link>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Lagre endringer
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  counter,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  counter?: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
          {required && <span className="ml-1 text-[var(--status-danger,#A32D2D)]">*</span>}
        </span>
        {counter && (
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {counter}
          </span>
        )}
      </div>
      {children}
      {help && <p className="mt-2 text-[11px] text-muted-foreground">{help}</p>}
    </div>
  );
}

function DateField({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border-2 border-border bg-[var(--surface,#FAFAF7)] px-4 py-2.5">
      <span className="font-mono text-[14px] font-medium tabular-nums text-foreground">
        {value}
      </span>
      <Calendar className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
    </div>
  );
}

function SegBtn({
  active,
  dotColor,
  label,
}: {
  active?: boolean;
  dotColor: string;
  label: string;
}) {
  return (
    <button
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors ${
        active
          ? "bg-card text-foreground shadow-sm"
          : "bg-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />
      {label}
    </button>
  );
}

function TagChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))] px-3 py-1 text-[12px] font-semibold text-primary">
      {label}
      <button
        className="grid h-3.5 w-3.5 place-items-center rounded-full text-current opacity-60 transition-opacity hover:bg-black/10 hover:opacity-100"
        aria-label={`Fjern ${label}`}
      >
        <X className="h-2.5 w-2.5" strokeWidth={2.5} />
      </button>
    </span>
  );
}
