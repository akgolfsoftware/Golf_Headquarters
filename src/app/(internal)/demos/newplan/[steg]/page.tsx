/**
 * PILOT — NewPlan modal-flyt (4 steg)
 * Dynamic route: /demos/newplan/[1..4] (under (internal) → ADMIN-only)
 * Bygd direkte fra wireframe/design-files-v2/modaler-A/{01..04}-newplan-steg*.html
 *
 * Mock-data for Øyvind Rohjan mot Sørlandsåpent (mai-juni 2026).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Check,
  FileText,
  Grid3x3,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type StegId = "1" | "2" | "3" | "4";
const VALID_STEG: readonly StegId[] = ["1", "2", "3", "4"] as const;

export default async function NewPlanStegPage({
  params,
}: {
  params: Promise<{ steg: string }>;
}) {
  const { steg } = await params;
  if (!VALID_STEG.includes(steg as StegId)) notFound();
  const current = steg as StegId;

  return (
    <ModalShell current={current}>
      {current === "1" && <Steg1 />}
      {current === "2" && <Steg2 />}
      {current === "3" && <Steg3 />}
      {current === "4" && <Steg4 />}
    </ModalShell>
  );
}

/* ============================================================
   MODAL-SHELL (felles for alle 4 steg)
   ============================================================ */

const STEG_META: Record<StegId, { title: string; lede: string; label: string }> = {
  "1": {
    title: "Ny treningsplan",
    lede: "Velg spiller, sett periode, og fordel pyramide-fokus. Tar under 2 minutter.",
    label: "Spiller & periode",
  },
  "2": {
    title: "Hvordan vil du bygge planen?",
    lede: "Velg utgangspunkt for de 8 ukene mellom 9. mai og 30. juni.",
    label: "Utgangspunkt",
  },
  "3": {
    title: "Tilpass øvelser",
    lede:
      "12 økter foreslått basert på mal «Sommer-toppform». Dra for å sortere, fjern de du ikke trenger.",
    label: "Tilpass økter",
  },
  "4": {
    title: "Bekreft og send",
    lede: "Gjennomgå sammendraget før du sender forslaget til Øyvind.",
    label: "Bekreft",
  },
};

function ModalShell({
  current,
  children,
}: {
  current: StegId;
  children: React.ReactNode;
}) {
  const meta = STEG_META[current];
  const idx = Number(current);
  return (
    <div className="min-h-screen bg-[var(--surface,#FAFAF7)]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[rgba(10,31,24,0.5)]" aria-hidden="true" />

      {/* Modal */}
      <div className="relative mx-auto my-8 max-w-[720px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 py-6">
          <div className="flex-1">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              AgencyOS · /admin/plans · ny plan
            </div>
            <h2 className="mt-1 font-display text-[22px] font-bold leading-tight tracking-tight">
              {meta.title}
            </h2>
            <p className="mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">{meta.lede}</p>
          </div>
          <Link
            href="/"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </Link>
        </header>

        {/* Stepper */}
        <div className="flex items-center gap-2 border-b border-border bg-[var(--surface-alt,#F1EEE5)] px-8 py-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Steg {current} av 4
          </span>
          <div className="ml-2 flex flex-1 items-center gap-1.5">
            {[1, 2, 3, 4].map((n) => {
              const state: "done" | "active" | "todo" =
                n < idx ? "done" : n === idx ? "active" : "todo";
              return (
                <div key={n} className="flex items-center gap-1.5">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                      state === "done"
                        ? "bg-primary text-primary-foreground"
                        : state === "active"
                          ? "bg-accent text-[var(--brand-accent-on,#005840)] ring-2 ring-primary/30"
                          : "bg-card text-muted-foreground ring-1 ring-border"
                    }`}
                  >
                    {state === "done" ? <Check className="h-3 w-3" strokeWidth={3} /> : n}
                  </div>
                  {n < 4 && (
                    <div
                      className={`h-[2px] w-6 ${n < idx ? "bg-primary" : "bg-border"}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-[12px] font-medium text-foreground">{meta.label}</span>
        </div>

        {/* Body */}
        <div className="flex max-h-[calc(100vh-280px)] flex-col gap-6 overflow-y-auto px-8 py-6">
          {children}
        </div>

        {/* Footer */}
        <ModalFooter current={current} />
      </div>
    </div>
  );
}

function ModalFooter({ current }: { current: StegId }) {
  const idx = Number(current);
  const prev = idx > 1 ? String(idx - 1) : null;
  const next = idx < 4 ? String(idx + 1) : null;

  const nextLabels: Record<number, string> = {
    1: "Neste — velg mal eller AI",
    2: "Neste",
    3: "Neste — bekreft",
  };

  return (
    <footer className="flex items-center justify-between gap-2 border-t border-border bg-[var(--surface-alt,#F1EEE5)] px-8 py-4">
      <Link
        href="/"
        className="rounded-md px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
      >
        Avbryt
      </Link>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={`/demos/newplan/${prev}`}
            className="inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            ← Tilbake
          </Link>
        ) : (
          <button
            disabled
            className="inline-flex cursor-not-allowed items-center rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-muted-foreground opacity-40"
          >
            ← Tilbake
          </button>
        )}
        {next ? (
          <Link
            href={`/demos/newplan/${next}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {nextLabels[idx]}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
        ) : (
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
            Send forslag → Øyvind
          </button>
        )}
      </div>
    </footer>
  );
}

/* ============================================================
   STEG 1 — Spiller & periode + pyramide
   ============================================================ */

function Steg1() {
  return (
    <>
      <section>
        <FieldLabel required>Spiller</FieldLabel>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-[var(--surface,#FAFAF7)] px-4 py-2">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary font-display text-[14px] font-semibold text-primary-foreground">
            MP
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-semibold leading-tight text-foreground">
              Øyvind Rohjan
            </div>
            <div className="mt-1 flex items-center gap-2.5 font-mono text-[11px] text-muted-foreground">
              <span>
                HCP <b className="font-semibold text-foreground">12,4</b>
              </span>
              <span>16 år · Kat A</span>
              <span>GFGK</span>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--brand-accent-on,#005840)]">
            PRO
          </span>
          <button className="rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            Bytt spiller
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Foreslått basert på siste plan-aktivitet og dine 18 aktive spillere.
        </p>
      </section>

      <section>
        <FieldLabel required>Periode</FieldLabel>
        <div className="grid grid-cols-[1fr_auto_1fr_auto] items-end gap-4">
          <div>
            <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Fra
            </div>
            <DateField value="9. mai 2026" />
          </div>
          <ArrowRight className="mb-2 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Til
            </div>
            <DateField value="30. juni 2026" />
          </div>
          <div className="mb-2 text-right font-mono text-[12px] leading-[1.4] text-muted-foreground">
            <b className="font-semibold text-primary">8 uker · 53 dager</b>
            <br />~ 32 økter
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Endpunkt 30. juni er forhåndsvalgt for Sørlandsåpent — du kan justere.
        </p>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <FieldLabel required>Pyramide-fokus</FieldLabel>
          <span className="rounded-md bg-[var(--status-success-bg,#E5F1EA)] px-2.5 py-1 font-mono text-[12px] font-semibold tabular-nums text-[var(--status-success,#1A7D56)]">
            Sum 100 %
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <PyrRow code="FYS" color="hsl(var(--success))" value={15} />
          <PyrRow code="TEK" color="hsl(var(--primary))" value={40} />
          <PyrRow code="SLAG" color="hsl(var(--accent))" value={25} />
          <PyrRow code="SPILL" color="#F4C430" value={15} />
          <PyrRow code="TURN" color="hsl(var(--muted-foreground))" value={5} />
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          Forhåndsfordeling fra Øyvind&apos; siste plan. Juster om Sørlandsåpent krever annet
          fokus.
        </p>
      </section>
    </>
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

function PyrRow({ code, color, value }: { code: string; color: string; value: number }) {
  return (
    <div className="grid grid-cols-[90px_1fr_60px] items-center gap-4 py-1">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
        {code}
      </div>
      <div className="relative h-2.5 rounded-full bg-[var(--surface-alt,#F1EEE5)]">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${value}%`, background: color }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-white shadow"
          style={{ left: `${value}%` }}
        />
      </div>
      <div className="text-right font-mono text-[13px] font-medium tabular-nums text-foreground">
        {value} <span className="text-[11px] text-muted-foreground">%</span>
      </div>
    </div>
  );
}

/* ============================================================
   STEG 2 — Utgangspunkt
   ============================================================ */

function Steg2() {
  return (
    <>
      {/* Selected summary */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-xl bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))] px-4 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-[12px] font-semibold text-primary-foreground">
          MP
        </div>
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
            Spiller & periode
          </div>
          <div className="text-[13px]">
            <b className="font-semibold text-foreground">Øyvind Rohjan</b>
            <span className="font-mono text-[11px] text-muted-foreground">
              {" "}
              · 9. mai – 30. juni · 8 uker · 32 økter
            </span>
          </div>
        </div>
        <Link
          href="/demos/newplan/1"
          className="rounded-md px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          Endre ←
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ChoiceCard
          icon={<Grid3x3 className="h-5 w-5" strokeWidth={1.75} />}
          badge="14 maler"
          title="Bruk mal"
          desc="Start fra ferdig-bygde planer som «Sommer-toppform» eller «Driver-fokus 6u»."
          feats={["Pre-pyramide", "Justerbar"]}
          arrowLabel="Velg mal"
        />
        <ChoiceCard
          icon={<Sparkles className="h-5 w-5" strokeWidth={1.75} />}
          badge="Anbefalt"
          badgeAccent
          title="AI-generer"
          desc="Anders&apos; agenter bygger planen fra Øyvind&apos; 90-dagers historikk og Sørlandsåpent-fokus."
          feats={["~15 sek", "Begrunnelse", "Editerbar"]}
          arrowLabel="Generer"
          highlighted
        />
        <ChoiceCard
          icon={<FileText className="h-5 w-5" strokeWidth={1.75} />}
          title="Start blank"
          desc="Bygg plan fra bunn — full kontroll, ingen forhåndsforslag."
          feats={["Manuell", "~5–8 min"]}
          arrowLabel="Tom plan"
          muted
        />
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Du kan endre alt i steg 3 — uansett valg.
      </p>
    </>
  );
}

function ChoiceCard({
  icon,
  badge,
  badgeAccent,
  title,
  desc,
  feats,
  arrowLabel,
  highlighted,
  muted,
}: {
  icon: React.ReactNode;
  badge?: string;
  badgeAccent?: boolean;
  title: string;
  desc: string;
  feats: string[];
  arrowLabel: string;
  highlighted?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`relative flex min-h-[260px] flex-col overflow-hidden rounded-xl border-2 p-6 transition-all ${
        highlighted
          ? "border-accent bg-[linear-gradient(180deg,color-mix(in srgb, var(--v2-lime) 10%, transparent),transparent_55%)]"
          : "border-border bg-card hover:border-primary hover:-translate-y-0.5"
      }`}
    >
      {highlighted && (
        <span className="absolute bottom-0 right-0 top-0 w-1 bg-accent" aria-hidden="true" />
      )}
      {badge && (
        <span
          className={`absolute right-3.5 top-3.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
            badgeAccent
              ? "bg-accent text-[var(--brand-accent-on,#005840)]"
              : "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground"
          }`}
        >
          {badge}
        </span>
      )}
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
          highlighted
            ? "bg-accent text-[var(--brand-accent-on,#005840)]"
            : muted
              ? "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground"
              : "bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))] text-primary"
        }`}
      >
        {icon}
      </div>
      <h3 className="mb-1.5 font-display text-[17px] font-semibold leading-tight tracking-tight text-foreground">
        {title}
      </h3>
      <p className="flex-1 text-[13px] leading-[1.5] text-muted-foreground">{desc}</p>
      <div className="mt-2 flex flex-col gap-1 font-mono text-[11px] text-muted-foreground">
        {feats.map((f) => (
          <span key={f}>→ {f}</span>
        ))}
      </div>
      <div
        className={`mt-2.5 inline-flex items-center gap-1.5 font-display text-[12px] font-semibold ${
          highlighted
            ? "text-[var(--brand-accent-on,#005840)]"
            : muted
              ? "text-muted-foreground"
              : "text-primary"
        }`}
      >
        {arrowLabel}
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </div>
    </div>
  );
}

/* ============================================================
   STEG 3 — Tilpass øvelser
   ============================================================ */

function Steg3() {
  return (
    <>
      {/* Summary row */}
      <div className="grid grid-cols-4 gap-2 rounded-xl bg-[var(--surface-alt,#F1EEE5)] px-6 py-4">
        <SummaryStat label="Antall økter" value="12" />
        <SummaryStat label="Total varighet" value="14 t 20m" />
        <SummaryStat label="Pyramide" value="40/25/15/15/5" tone="primary" />
        <SummaryStat label="Fordelt på" value="8 uker" />
      </div>

      <ExerciseSection title="Uke 19 — TEK-fokus" sub="4 økter · 4 t 50m">
        <ExerciseRow num="01" name="Iron-treff 7-jern" sub="Range · 50 baller · video" cat="tek" dur="75 min" />
        <ExerciseRow
          num="02"
          name="Driver-konsistens"
          sub="Range · 35 baller · TrackMan"
          cat="slag"
          dur="60 min"
          dragging
        />
        <ExerciseRow num="03" name="Wedge 30–80m kontroll" sub="Short game-areal · 40 baller" cat="tek" dur="60 min" />
        <ExerciseRow num="04" name="Styrkeøkt — rotasjon & bein" sub="Gym · 45 min · video lenket" cat="fys" dur="45 min" />
      </ExerciseSection>

      <ExerciseSection title="Uke 20 — TEK + SLAG" sub="4 økter · 4 t 45m">
        <ExerciseRow num="05" name="Putt 1–3m konvertering" sub="Grønn · stress-drill" cat="tek" dur="45 min" />
        <ExerciseRow num="06" name="9 hull spillsimulering" sub="Bane · pre-shot rutine" cat="spill" dur="90 min" />
        <ExerciseRow num="07" name="Driver — start linje" sub="Range · launch-monitor" cat="slag" dur="60 min" />
        <ExerciseRow num="08" name="Mobilitet hofte/skuldre" sub="Hjemme · 30 min app" cat="fys" dur="30 min" />
      </ExerciseSection>

      <ExerciseSection title="Uke 21 — SLAG-overgang" sub="4 økter · 4 t 45m">
        <ExerciseRow num="09" name="Turneringssimulering — 18 hull" sub="Bane · scorecard" cat="turn" dur="3 t 30m" />
        <ExerciseRow num="10" name="Bunker — out & spin" sub="Short game · 30 baller" cat="tek" dur="45 min" />
        <ExerciseRow num="11" name="9 hull — pre-shot rutine" sub="Bane · video debrief" cat="spill" dur="90 min" />
        <ExerciseRow num="12" name="Hastighet — driver swing speed" sub="SuperSpeed · 3 sets" cat="fys" dur="30 min" />
      </ExerciseSection>

      <button className="inline-flex w-fit items-center gap-2 rounded-lg border-2 border-dashed border-border bg-transparent px-4 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:border-primary hover:bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))]">
        <span className="text-base leading-none">+</span>
        Legg til øvelse
      </button>
    </>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary";
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={`font-display text-[18px] font-semibold tracking-tight ${
          tone === "primary" ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ExerciseSection({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h4 className="font-display text-[13px] font-semibold tracking-tight text-foreground">
          {title}
        </h4>
        <span className="font-mono text-[11px] text-muted-foreground">{sub}</span>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

type CatKind = "fys" | "tek" | "slag" | "spill" | "turn";

function ExerciseRow({
  num,
  name,
  sub,
  cat,
  dur,
  dragging = false,
}: {
  num: string;
  name: string;
  sub: string;
  cat: CatKind;
  dur: string;
  dragging?: boolean;
}) {
  const catStyles: Record<CatKind, string> = {
    fys: "bg-[rgba(22,163,74,0.12)] text-success",
    tek: "bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))] text-primary",
    slag: "bg-[color-mix(in srgb, var(--v2-lime) 20%, transparent)] text-[var(--brand-accent-on,#005840)] border border-[rgba(184,200,46,0.4)]",
    spill: "bg-[rgba(244,196,48,0.14)] text-warning",
    turn: "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground",
  };
  return (
    <div
      className={`grid grid-cols-[20px_36px_1fr_auto_auto_28px] items-center gap-2 rounded-lg px-4 py-2.5 transition-all ${
        dragging
          ? "border-2 border-primary bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))] shadow-md"
          : "border border-border bg-[var(--surface,#FAFAF7)] hover:border-muted-foreground"
      }`}
    >
      <span
        className={`grid place-items-center ${dragging ? "text-primary" : "text-muted-foreground"}`}
        aria-hidden="true"
      >
        <span className="grid h-4 w-3.5 grid-cols-2 gap-[3px]">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="h-[3px] w-[3px] rounded-full bg-current" />
          ))}
        </span>
      </span>
      <span className="text-center font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
        {num}
      </span>
      <span className="text-[13px] font-medium leading-tight text-foreground">
        {name}
        <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{sub}</span>
      </span>
      <span
        className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${catStyles[cat]}`}
      >
        {cat.toUpperCase()}
      </span>
      <span className="min-w-[50px] text-right font-mono text-[12px] font-medium tabular-nums text-muted-foreground">
        {dur}
      </span>
      <button
        className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--status-danger-bg,#FBE9E9)] hover:text-[var(--status-danger,#A32D2D)]"
        aria-label="Fjern øvelse"
      >
        <X className="h-3 w-3" strokeWidth={2} />
      </button>
    </div>
  );
}

/* ============================================================
   STEG 4 — Bekreft og send
   ============================================================ */

function Steg4() {
  return (
    <>
      <div className="grid grid-cols-[1fr_200px] gap-6 rounded-2xl border border-border bg-[var(--surface,#FAFAF7)] p-6">
        <div>
          <h3 className="font-display text-[22px] font-medium italic tracking-tight text-foreground">
            Sommer-toppform 2026
          </h3>
          <div className="mt-1 font-mono text-[12px] text-muted-foreground">
            9. mai – 30. juni 2026 · 8 uker · 32 økter
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4.5 border-t border-border pt-4">
            <SumMeta
              label="Spiller"
              value={
                <span className="inline-flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    MP
                  </span>
                  Øyvind Rohjan
                </span>
              }
            />
            <SumMeta
              label="Coach"
              value={
                <span className="inline-flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-semibold text-accent">
                    AK
                  </span>
                  Anders Kristiansen
                </span>
              }
            />
            <SumMeta label="Mal" value="Sommer-toppform" />
            <SumMeta
              label="Milestones"
              value={
                <>
                  1 — <span className="text-primary">Sørlandsåpent</span>
                </>
              }
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <PyrDonut />
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
            <DonutLegend swatch="hsl(var(--primary))" label="TEK" pct="40%" />
            <DonutLegend swatch="hsl(var(--accent))" label="SLAG" pct="25%" />
            <DonutLegend swatch="hsl(var(--success))" label="FYS" pct="15%" />
            <DonutLegend swatch="#F4C430" label="SPILL" pct="15%" />
            <DonutLegend swatch="hsl(var(--muted-foreground))" label="TURN" pct="5%" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 rounded-xl bg-[var(--surface-alt,#F1EEE5)] p-4">
        <CheckRow
          checked
          title="Send forslag til Øyvind til godkjenning"
          sub="Øyvind får varsel i PlayerHQ og e-post · godkjenner eller ber om endring"
        />
        <CheckRow
          checked
          title="Notifiser foresatte (Mor: Anne Pedersen)"
          sub="Read-only sammendrag på e-post · ingen handlinger kreves"
        />
        <CheckRow
          title="Del med GFGK-trener-kollega (Tor S.)"
          sub="Andre coachen får read-only tilgang for second-opinion"
        />
      </div>

      <div className="rounded-r-lg border-l-2 border-accent bg-[var(--accent-bg,color-mix(in srgb, var(--v2-lime) 10%, transparent))] px-4 py-2.5 font-mono text-[11px] leading-[1.5] text-muted-foreground">
        Øyvind får 7 dager på seg til å godkjenne. Etter det aktiveres planen automatisk. Du kan
        justere og resende fra plan-detaljsiden når som helst.
      </div>
    </>
  );
}

function SumMeta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-[14px] font-semibold text-foreground">{value}</span>
    </div>
  );
}

function PyrDonut() {
  // Donut: r=15.91549, circumference 100
  return (
    <div className="relative h-[140px] w-[140px]">
      <svg viewBox="0 0 42 42" className="h-full w-full" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-border,#E5E3DD)" strokeWidth="6" />
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#005840" strokeWidth="6" strokeDasharray="40 60" />
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#D1F843" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-40" />
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#16A34A" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="-65" />
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#F4C430" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="-80" />
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#5E5C57" strokeWidth="6" strokeDasharray="5 95" strokeDashoffset="-95" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-[22px] font-bold leading-none tracking-tight text-foreground">
            100
          </div>
          <div className="mt-1 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            % Fordelt
          </div>
        </div>
      </div>
    </div>
  );
}

function DonutLegend({ swatch, label, pct }: { swatch: string; label: string; pct: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-sm" style={{ background: swatch }} />
      {label} <b className="ml-auto font-semibold text-foreground">{pct}</b>
    </div>
  );
}

function CheckRow({
  checked = false,
  title,
  sub,
}: {
  checked?: boolean;
  title: string;
  sub: string;
}) {
  return (
    <label className="grid cursor-pointer grid-cols-[22px_1fr] items-start gap-2">
      <span
        className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md ${
          checked
            ? "bg-primary text-accent"
            : "border-2 border-border bg-card"
        }`}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span>
        <span className="block text-[13px] font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{sub}</span>
      </span>
    </label>
  );
}

/* ============================================================
   FELLES HJELPERE
   ============================================================ */

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
      {required && <span className="ml-1 text-[var(--status-danger,#A32D2D)]">*</span>}
    </div>
  );
}
