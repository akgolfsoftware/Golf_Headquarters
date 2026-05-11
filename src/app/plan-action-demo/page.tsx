/**
 * PILOT — PlanActionDetail (Urgent agent-forslag)
 * URL: /plan-action-demo
 * Bygd fra wireframe/design-files-v2/modaler-A/08-plan-action-detail.html
 */

import Link from "next/link";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";

export default function PlanActionDemo() {
  return (
    <div className="min-h-screen bg-[var(--surface,#FAFAF7)]">
      <div className="fixed inset-0 bg-[rgba(10,31,24,0.5)]" aria-hidden="true" />

      <div className="relative mx-auto my-8 max-w-[720px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 py-6">
          <div className="flex-1">
            <SeverityPill />
            <h2 className="mt-3 font-display text-[24px] font-bold leading-tight tracking-tight">
              Pauseuke anbefalt før Sørlandsåpent
            </h2>
            <div className="mt-2.5 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                MP
              </span>
              <span className="text-[13px] font-semibold text-foreground">
                Markus R. Pedersen
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                · Kat A · HCP 12,4 · 14 dager uten pause
              </span>
            </div>
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
        <div className="flex max-h-[calc(100vh-260px)] flex-col gap-5 overflow-y-auto px-8 py-6">
          {/* 1 — Kontekst */}
          <SectionBlock label="1 · Kontekst">
            <p className="font-display text-[15px] italic leading-[1.55] text-foreground">
              Markus har trent 14 dager på rad uten pause. Adherence holder seg på 91 %, men
              SG-trend flater ut siste 5 dager. Søvn-tid er ned 8 % og morgenpuls opp 4 slag.
            </p>

            <div className="grid grid-cols-4 overflow-hidden rounded-lg border border-border bg-[var(--surface,#FAFAF7)]">
              <DataCell label="Volum 4u" value="14 t" delta="+18%" deltaDown />
              <DataCell label="Hvilepuls" value="62" delta="+4" warn deltaDown />
              <DataCell label="SG-trend 5d" value="−0,3" warn />
              <DataCell label="Søvn snitt" value="6 t 50" delta="−25 min" warn deltaDown last />
            </div>
          </SectionBlock>

          {/* 2 — Agentens analyse */}
          <SectionBlock label="2 · Agentens analyse" topBorder>
            <div className="grid grid-cols-[auto_1fr] items-center gap-3.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary py-1.5 pl-2 pr-3 font-display text-[12px] font-semibold text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="tracking-tight">Deload-agent</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--status-success,#1A7D56),var(--color-accent,#D1F843))]"
                    style={{ width: "87%" }}
                  />
                </div>
                <span className="font-mono text-[12px] font-semibold tabular-nums text-foreground">
                  Konfidens 87 %
                </span>
              </div>
            </div>

            <p className="text-[14px] leading-[1.6] text-foreground">
              Kombinasjonen av <b className="font-semibold">flat SG-trend</b>,{" "}
              <b className="font-semibold">økt hvilepuls</b> og{" "}
              <b className="font-semibold">kortere søvn</b> matcher Markus&apos;
              overtrenings-mønster fra forrige sesong (sept 2025). Da resulterte tilsvarende
              signal-stack i 9 % SG-fall over 3 uker. Agenten foreslår{" "}
              <b className="font-semibold">full pauseuke i uke 23</b> — 6 uker før Sørlandsåpent
              — for å unngå peak-form-tap.
            </p>
          </SectionBlock>

          {/* 3 — Foreslått endring */}
          <SectionBlock label="3 · Foreslått endring" topBorder>
            <div className="overflow-hidden rounded-xl border border-border bg-[var(--surface,#FAFAF7)]">
              <DiffRow
                week="Uke 23"
                before="4 TEK-økter · 4 t 20m"
                after={
                  <>
                    0 økter · <b className="font-semibold">PAUSE-uke</b>
                  </>
                }
              />
              <DiffRow
                week="Uke 24"
                before="3 SLAG-økter"
                after="4 SLAG-økter · friskere"
                bordered
              />
            </div>
          </SectionBlock>

          {/* 4 — Forventet effekt */}
          <SectionBlock label="4 · Forventet effekt" topBorder>
            <ul className="flex flex-col gap-2">
              <EffectItem importance="primært">
                Reduserer overtrenings-risiko (97 → 22 %)
              </EffectItem>
              <EffectItem>Friskere TEK-fase i uke 24, høyere kvalitet pr. økt</EffectItem>
              <EffectItem importance="turneringsmål">
                Peak-form på Sørlandsåpent (28.–30. juni) sannsynlig
              </EffectItem>
              <EffectItem>Hvilepuls antas å falle 2–3 slag innen uke 24</EffectItem>
            </ul>
          </SectionBlock>
        </div>

        {/* Footer */}
        <footer className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 border-t border-border bg-[var(--surface-alt,#F1EEE5)] px-8 py-4">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            Lukk
          </Link>
          <div />
          <button className="rounded-md border border-[var(--status-danger,#A32D2D)] bg-transparent px-3.5 py-2 text-[13px] font-medium text-[var(--status-danger,#A32D2D)] transition-colors hover:bg-[var(--status-danger-bg,#FBE9E9)]">
            Avvis
          </button>
          <button className="rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
            Rediger →
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Godkjenn →
          </button>
        </footer>
      </div>
    </div>
  );
}

function SeverityPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-danger,#A32D2D)] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white">
      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
      Urgent
    </span>
  );
}

function SectionBlock({
  label,
  topBorder,
  children,
}: {
  label: string;
  topBorder?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`flex flex-col gap-3 ${topBorder ? "border-t border-border pt-5" : ""}`}
    >
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </section>
  );
}

function DataCell({
  label,
  value,
  delta,
  warn,
  deltaDown,
  last,
}: {
  label: string;
  value: string;
  delta?: string;
  warn?: boolean;
  deltaDown?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 px-3.5 py-3 ${!last ? "border-r border-border" : ""}`}
    >
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={`flex items-baseline gap-1.5 font-mono text-[15px] font-semibold tabular-nums ${
          warn ? "text-[var(--status-danger,#A32D2D)]" : "text-foreground"
        }`}
      >
        {value}
        {delta && (
          <span
            className={`font-mono text-[11px] font-semibold ${
              deltaDown ? "text-[var(--status-danger,#A32D2D)]" : "text-foreground"
            }`}
          >
            {delta}
          </span>
        )}
      </span>
    </div>
  );
}

function DiffRow({
  week,
  before,
  after,
  bordered,
}: {
  week: string;
  before: React.ReactNode;
  after: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[80px_1fr_20px_1fr] items-center gap-3 px-4 py-3.5 ${
        bordered ? "border-t border-border" : ""
      }`}
    >
      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {week}
      </span>
      <span className="rounded-lg bg-[var(--status-danger-bg,#FBE9E9)] px-3 py-2 text-[13px] text-foreground line-through decoration-[rgba(163,45,45,0.5)] decoration-2">
        {before}
      </span>
      <span className="grid place-items-center text-muted-foreground">
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="rounded-lg bg-[var(--status-success-bg,#E5F1EA)] px-3 py-2 text-[13px] font-semibold text-foreground">
        {after}
      </span>
    </div>
  );
}

function EffectItem({
  children,
  importance,
}: {
  children: React.ReactNode;
  importance?: string;
}) {
  return (
    <li className="grid grid-cols-[20px_1fr] items-center gap-3 text-[14px] text-foreground">
      <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-[var(--status-success-bg,#E5F1EA)] text-[var(--status-success,#1A7D56)]">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span>
        {children}
        {importance && (
          <span className="ml-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {importance}
          </span>
        )}
      </span>
    </li>
  );
}
