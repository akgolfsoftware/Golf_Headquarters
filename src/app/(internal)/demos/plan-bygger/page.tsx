/**
 * PILOT — CoachHQ Plan-bygger · Steg 4 (Pyramide-allokasjon)
 * Bygd direkte fra wireframe/design-files-v2/coachhq-A/02-plan-bygger.html
 * URL: /demos/plan-bygger (under (internal) → ADMIN-only)
 *
 * Mock-data for Øyvind Rohjan. Bytt til Prisma-henting senere.
 */

import { Check, Sparkles } from "lucide-react";

export default function PlanByggerDemo() {
  return (
    <div className="min-h-screen bg-[var(--surface,#FAFAF7)] text-foreground">
      <main className="mx-auto max-w-[1240px] px-8 py-8">
        {/* Page head */}
        <header className="mb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Treningsplaner · Ny plan · Øyvind Rohjan · Kategori A · HCP +2,4
          </span>
          <h1 className="mt-1 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
            <em className="font-medium italic">Bygg ny plan</em> · Sørlandsåpent 2026
          </h1>
          <p className="mt-2 max-w-[760px] text-[13px] leading-[1.55] text-muted-foreground">
            Wizard med 6 steg. Periodiserings-agent foreslår faser og pyramide-allokasjon basert på
            turneringsdato, kursprofil og spillerens SG-trender.
          </p>
        </header>

        {/* Step indicator */}
        <div className="mb-6 grid grid-cols-6 gap-2">
          <StepCard num="1" name="Spiller" sub="Øyvind R. valgt" state="done" />
          <StepCard num="2" name="Periode" sub="8 uker · 32 økter" state="done" />
          <StepCard num="3" name="Faser" sub="5 auto-foreslått" state="done" />
          <StepCard
            num="4"
            name="Pyramide-allokasjon"
            sub="Drag for å justere"
            state="current"
          />
          <StepCard num="5" name="Økt-skjelett" sub="Auto-bygges" state="todo" />
          <StepCard num="6" name="Bekreft" sub="Send til Øyvind" state="todo" />
        </div>

        {/* Agent strip */}
        <div
          className="mb-6 flex items-center gap-4 rounded-lg border border-[rgba(0,88,64,0.18)] border-l-4 border-l-[var(--brand-primary,#005840)] px-4 py-4"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(0,88,64,0.06) 0%, rgba(209,248,67,0.10) 100%)",
          }}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary,#005840)] font-mono text-[11px] font-bold text-[var(--brand-accent,#D1F843)]">
            PA
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Plan-watcher · agent-forslag
            </div>
            <p className="mt-1 max-w-[720px] text-[13px] leading-[1.5] text-foreground">
              <b className="font-semibold">Foreslår SLAG 35 % i Spesifikk-fase</b> — Bjaavann har
              sandbase med dyp bunkersand, og Øyvind&apos; SG-arg er −0,1 siste 30 d. Reduser FYS
              til 10 % og TEK til 15 % for å gi rom.
            </p>
          </div>
          <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
            Avvis
          </button>
          <button className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-[var(--brand-accent-on,#005840)] transition-opacity hover:opacity-90">
            Bruk forslag
          </button>
        </div>

        {/* Phase cards */}
        <div className="mb-6 grid grid-cols-5 gap-2.5">
          <PhaseCard num="Fase 1" tag="Base" name="Base" dates="9.–22. mai · 2 u" progress={100} />
          <PhaseCard
            num="Fase 2"
            tag="Forb."
            name="Forberedelse"
            dates="23.–29. mai · 1 u"
            progress={100}
          />
          <PhaseCard
            current
            num="FASE 3 · NÅ"
            tag="Spes."
            name="Spesifikk"
            dates="30. mai – 1. jun · 3 u"
            progress={64}
          />
          <PhaseCard num="Fase 4" tag="Taper" name="Taper" dates="2.–4. jun · 3 d" progress={0} />
          <PhaseCard
            num="Fase 5"
            tag="Peak"
            name="Peak"
            dates="2.–4. jun · turnering"
            progress={0}
            barColor="var(--color-pyr-spill,#D1F843)"
          />
        </div>

        {/* Builder grid */}
        <div className="grid grid-cols-[1fr_360px] gap-6">
          {/* Slider panel */}
          <section className="rounded-2xl border border-border bg-card px-6 py-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Steg 4 · Spesifikk-fase
                </div>
                <h3 className="mt-1 font-display text-[20px] font-bold leading-tight tracking-tight">
                  Hvordan tid fordeles i fase 3
                </h3>
                <p className="mt-1 max-w-[500px] text-[12px] leading-[1.5] text-muted-foreground">
                  Sum må være 100 %. Subtil bar under hver slider viser hva Øyvind har faktisk trent
                  siste 4 uker — for kontekst.
                </p>
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                AI-forslag
              </button>
            </div>

            <SliderBlock
              color="var(--color-pyr-fys,#005840)"
              code="FYS"
              label="fysisk fundament"
              value={10}
              historyPct={18}
              historyBg="rgba(22,163,74,0.30)"
              historyLabel="Faktisk siste 4 u: 18 %"
            />
            <SliderBlock
              color="var(--color-pyr-tek,#B8852A)"
              code="TEK"
              label="teknikk"
              value={15}
              historyPct={32}
              historyBg="rgba(184,133,42,0.30)"
              historyLabel="Faktisk siste 4 u: 32 %"
            />
            <SliderBlock
              color="var(--color-pyr-slag,#2563EB)"
              code="SLAG"
              label="slagprogresjon"
              value={35}
              historyPct={24}
              historyBg="rgba(37,99,235,0.30)"
              historyLabel="Faktisk siste 4 u: 24 % · agent foreslår løft"
            />
            <SliderBlock
              color="var(--color-pyr-spill,#D1F843)"
              code="SPILL"
              label="banespill"
              value={30}
              historyPct={14}
              historyBg="rgba(209,248,67,0.40)"
              historyLabel="Faktisk siste 4 u: 14 %"
            />
            <SliderBlock
              color="var(--color-pyr-turn,#A32D2D)"
              code="TURN"
              label="turnering"
              value={10}
              historyPct={12}
              historyBg="rgba(163,45,45,0.30)"
              historyLabel="Faktisk siste 4 u: 12 %"
            />

            <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
              <div>
                <div className="font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Sum allokasjon
                </div>
                <div className="mt-1 font-mono text-[28px] font-semibold tabular-nums leading-none text-[var(--status-success,#1A7D56)]">
                  100 %
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-success-bg,#E5F1EA)] px-4 py-1.5 text-[12px] font-medium text-[var(--status-success,#1A7D56)]">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                Klar for neste steg
              </div>
            </div>
          </section>

          {/* Side cards */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card px-6 py-6">
              <h4 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Spiller
              </h4>
              <div className="mb-4 grid grid-cols-[48px_1fr] items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary,#005840)] font-display text-[16px] font-semibold text-white">
                  M
                </div>
                <div>
                  <div className="text-[14px] font-semibold leading-tight">Øyvind Rohjan</div>
                  <div className="mt-1 text-[11px] leading-[1.3] text-muted-foreground">
                    Kategori A · 17 år · WANG
                  </div>
                </div>
              </div>
              <StatRow label="HCP" value="+2,4" />
              <StatRow label="SG total 12u" value="+0,8" tone="success" />
              <StatRow label="SG-arg 30d" value="−0,1" tone="danger" />
              <StatRow label="Sist trent" value="i dag" last />
            </div>

            <div className="rounded-2xl border border-border bg-card px-6 py-6">
              <h4 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Periode
              </h4>
              <StatRow label="Start" value="9. mai 2026" />
              <StatRow label="Slutt" value="1. jul 2026" />
              <StatRow label="Varighet" value="8 uker" />
              <StatRow label="Økter" value="32 totalt" />
              <StatRow label="Peak" value="2.–4. juni" last />
            </div>

            <div className="rounded-2xl border border-border bg-card px-6 py-6">
              <h4 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Turneringer i perioden
              </h4>
              <StatRow label="Sørlandsåpent" value="02.06" />
              <StatRow label="NM-kvalik" value="21.06" />
              <StatRow label="Klubbmesterskap" value="28.06" last />
            </div>
          </aside>
        </div>

        {/* Footer bar */}
        <div className="mt-6 flex items-center justify-between gap-2.5 border-t border-border pt-4">
          <div className="flex gap-2.5">
            <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              Avbryt
            </button>
            <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              Lagre utkast
            </button>
          </div>
          <div className="flex gap-2.5">
            <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              ← Tilbake til faser
            </button>
            <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Neste: Økt-skjelett →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepCard({
  num,
  name,
  sub,
  state,
}: {
  num: string;
  name: string;
  sub: string;
  state: "done" | "current" | "todo";
}) {
  const isCurrent = state === "current";
  const isDone = state === "done";
  return (
    <div
      className={`relative rounded-[14px] bg-card px-4 py-4 ${
        isCurrent
          ? "border-2 border-accent"
          : "border border-border"
      }`}
    >
      <div
        className={`mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[12px] font-semibold leading-none ${
          isDone
            ? "bg-[var(--brand-primary,#005840)] text-white"
            : isCurrent
              ? "bg-accent text-[var(--brand-accent-on,#005840)]"
              : "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground"
        }`}
      >
        {num}
      </div>
      <div className="text-[13px] font-semibold leading-tight text-foreground">{name}</div>
      <div className="mt-1 text-[11px] leading-[1.3] text-muted-foreground">{sub}</div>
      {isDone && (
        <Check
          className="absolute right-3 top-3 h-4 w-4 text-[var(--brand-primary,#005840)]"
          strokeWidth={2.5}
        />
      )}
    </div>
  );
}

function PhaseCard({
  num,
  tag,
  name,
  dates,
  progress,
  current = false,
  barColor,
}: {
  num: string;
  tag: string;
  name: string;
  dates: string;
  progress: number;
  current?: boolean;
  barColor?: string;
}) {
  return (
    <div
      className={`rounded-[14px] bg-card p-4 ${
        current ? "border-2 border-accent" : "border border-border"
      }`}
    >
      <div className="flex items-center justify-between font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {current ? (
          <b className="rounded-md bg-accent px-1.5 py-0.5 text-[var(--brand-accent-on,#005840)]">
            {num}
          </b>
        ) : (
          <span>{num}</span>
        )}
        <span>{tag}</span>
      </div>
      <div className="mb-1 mt-1.5 text-[14px] font-semibold leading-tight text-foreground">
        {name}
      </div>
      <div className="font-mono text-[11px] font-medium leading-[1.3] text-muted-foreground">
        {dates}
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-sm bg-[var(--surface-alt,#F1EEE5)]">
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: barColor ?? "var(--brand-primary,#005840)",
          }}
        />
      </div>
    </div>
  );
}

function SliderBlock({
  color,
  code,
  label,
  value,
  historyPct,
  historyBg,
  historyLabel,
}: {
  color: string;
  code: string;
  label: string;
  value: number;
  historyPct: number;
  historyBg: string;
  historyLabel: string;
}) {
  return (
    <div className="border-b border-[var(--line-soft,#EFEDE6)] py-4 last:border-b-0">
      <div className="grid grid-cols-[100px_1fr_70px] items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-[3px]"
            style={{ background: color }}
          />
          <div>
            <b className="text-[13px] font-semibold leading-none">{code}</b>
            <div className="mt-1 text-[11px] leading-none text-muted-foreground">{label}</div>
          </div>
        </div>
        <div className="relative h-2 rounded-[4px] bg-[var(--surface-alt,#F1EEE5)]">
          <div
            className="absolute left-0 top-0 h-full rounded-[4px]"
            style={{ width: `${value}%`, background: color }}
          />
          <div
            className="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow"
            style={{ left: `${value}%`, borderColor: color }}
          />
        </div>
        <div className="text-right font-mono text-[18px] font-semibold tabular-nums leading-none">
          {value} %
        </div>
      </div>
      <div
        className="ml-[114px] mt-1.5 h-[3px] overflow-hidden rounded-[2px] bg-[var(--surface-alt,#F1EEE5)]"
        style={{ maxWidth: "calc(100% - 184px)" }}
      >
        <div className="h-full" style={{ width: `${historyPct}%`, background: historyBg }} />
      </div>
      <div className="ml-[114px] mt-1.5 text-[10px] font-medium leading-none text-muted-foreground">
        {historyLabel}
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  tone,
  last = false,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
  last?: boolean;
}) {
  const valueClass =
    tone === "success"
      ? "text-[var(--status-success,#1A7D56)]"
      : tone === "danger"
        ? "text-[var(--status-danger,#A32D2D)]"
        : "";
  return (
    <div
      className={`flex items-center justify-between py-2 ${
        last ? "" : "border-b border-[var(--line-soft,#EFEDE6)]"
      }`}
    >
      <span className="text-[12px] font-medium leading-none text-muted-foreground">{label}</span>
      <span
        className={`font-mono text-[13px] font-semibold tabular-nums leading-none ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}
