/**
 * DEMO — CoachHQ Spiller-detalj (light)
 * Spec: design2.0/04-coachhq-D/spec.md (Pakke 2/2)
 * URL: /spiller-detalj-light-demo
 *
 * Default state: Status-tab, lyst tema. Ingen sidebar/shell.
 */

import {
  ArrowUpRight,
  ChevronRight,
  Phone,
  Send,
  Calendar,
  Edit3,
  Tag,
  HeartPulse,
  Sparkles,
  Check,
  X,
} from "lucide-react";

const TABS = ["Status", "Plan", "Sessions", "Tester", "Tournaments", "Notater"] as const;

export default function SpillerDetaljLightDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-8 py-10 pb-32">
        {/* Header */}
        <header className="mb-6">
          <button className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
            Tilbake til elever
          </button>

          <div className="flex items-start gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary font-mono text-[22px] font-semibold text-primary-foreground">
              HN
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Elever · Light-profil
              </span>
              <h1 className="mt-1 font-display text-[32px] font-semibold leading-[1.05] tracking-tight">
                Henrik Nilsen
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Kategori B · Pro · 19 år · Coach: Anders K
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatPill label="HCP" value="8,7" />
                <StatPill label="Sist trent" value="i går" />
                <StatPill label="Plan-fremdrift" value="58 %" />
                <StatPill label="Åpne agent-action" value="2" tone="warning" />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                <Calendar size={16} strokeWidth={1.5} />
                Book økt
              </button>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground underline-offset-4 hover:underline"
              >
                Se 360-profil
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav className="mb-8 flex gap-1 border-b border-border">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`relative px-4 py-3 text-[13px] font-medium transition-colors ${
                i === 0
                  ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Status-tab content */}
        <div className="grid grid-cols-12 gap-4">
          <StatRich label="HCP" value="8,7" delta="−0,3" sub="siste 12 uker" />
          <StatRich label="SG total" value="+0,42" delta="+0,18" sub="snitt over 8 runder" valueColor="success" />
          <StatRich label="Økter · 12u" value="34" delta="+6" sub="i snitt 2,8 / uke" />
          <StatRich label="Plan-fremdrift" value="58 %" delta="på plan" deltaTone="flat" sub="13 av 24 økter" />

          {/* Pyramide-mini */}
          <section className="col-span-12 rounded-lg border border-border bg-card p-6 lg:col-span-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Pyramide · siste 4 uker
                </div>
                <h3 className="mt-1 font-display text-[16px] font-semibold leading-snug">
                  Trenings-fordeling
                </h3>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                14,5 t loggført
              </span>
            </div>
            <div className="grid grid-cols-[160px_1fr] items-center gap-6">
              <Donut />
              <div className="space-y-2">
                <TierRow color="#16A34A" name="FYS" value="16 %" />
                <TierRow color="#005840" name="TEK" value="28 %" warn />
                <TierRow color="#D1F843" name="SLAG" value="26 %" />
                <TierRow color="#F4C430" name="SPILL" value="18 %" />
                <TierRow color="#5E5C57" name="TURN" value="12 %" />
              </div>
            </div>
          </section>

          {/* Heatmap-stripe */}
          <section className="col-span-12 rounded-lg border border-border bg-card p-6 lg:col-span-6">
            <div className="mb-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                8 uker historikk
              </div>
              <h3 className="mt-1 font-display text-[16px] font-semibold leading-snug">
                Hva ble trent når
              </h3>
            </div>
            <div className="grid grid-cols-[48px_repeat(8,1fr)] gap-1.5">
              <div />
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="text-center font-mono text-[10px] font-medium text-muted-foreground">
                  u{14 + i}
                </div>
              ))}
              <HmRow label="FYS" levels={[2, 3, 2, 1, 2, 3, 4, 3]} color="#16A34A" />
              <HmRow label="TEK" levels={[1, 2, 3, 3, 4, 4, 3, 4]} color="#005840" />
              <HmRow label="SLAG" levels={[1, 2, 3, 3, 3, 4, 3, 3]} color="#D1F843" />
              <HmRow label="SPILL" levels={[1, 1, 2, 2, 3, 3, 4, 3]} color="#F4C430" />
              <HmRow label="TURN" levels={[1, 1, 1, 2, 3, 1, 2, 4]} color="#5E5C57" />
            </div>
          </section>

          {/* Foreldre-card */}
          <section className="col-span-12 rounded-lg border border-border bg-card p-6 lg:col-span-6">
            <div className="mb-4 flex items-center gap-2">
              <HeartPulse size={16} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Foresatte
              </span>
            </div>
            <h3 className="font-display text-[16px] font-semibold leading-snug">
              Anne Nilsen · Jan Nilsen
            </h3>
            <div className="mt-3 space-y-2">
              <a
                href="tel:+4748122309"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-foreground hover:underline"
              >
                <Phone size={14} strokeWidth={1.5} />
                +47 481 22 309
                <span className="text-muted-foreground"> · Anne</span>
              </a>
            </div>
            <button className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              <Send size={14} strokeWidth={1.5} />
              Send foreldre-oppdatering
            </button>
          </section>

          {/* Agent-strip */}
          <section className="col-span-12 rounded-lg border border-accent/40 bg-accent/15 p-6 lg:col-span-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={16} strokeWidth={1.5} className="text-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-foreground">
                Periodisering-agent
              </span>
            </div>
            <p className="text-[14px] leading-snug text-foreground">
              Foreslår <b>TEK-økning 28 → 34 %</b> før Sørlandsåpent (12. juni). Grunnlag: pitch-konsistens
              har platået siste 3 uker.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                <X size={14} strokeWidth={1.5} />
                Avvis
              </button>
              <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                <Check size={14} strokeWidth={1.5} />
                Godkjenn
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky quick-actions */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center gap-2 px-8 py-3">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Hurtighandlinger
          </span>
          <QuickAction icon={<Send size={14} strokeWidth={1.5} />} label="Send melding" />
          <QuickAction icon={<Calendar size={14} strokeWidth={1.5} />} label="Book økt" primary />
          <QuickAction icon={<Edit3 size={14} strokeWidth={1.5} />} label="Endre plan" />
          <QuickAction icon={<Tag size={14} strokeWidth={1.5} />} label="Endre kategori" />
          <QuickAction icon={<HeartPulse size={14} strokeWidth={1.5} />} label="Marker skadet" tone="destructive" />
        </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "warning";
}) {
  const bg =
    tone === "warning"
      ? "bg-[#FFF0D6] text-[#B8852A] border-[#F4C430]/30"
      : "bg-secondary text-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] ${bg}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold tabular-nums">{value}</span>
    </span>
  );
}

function StatRich({
  label,
  value,
  delta,
  sub,
  valueColor,
  deltaTone = "up",
}: {
  label: string;
  value: string;
  delta: string;
  sub: string;
  valueColor?: "success";
  deltaTone?: "up" | "flat";
}) {
  const deltaStyle =
    deltaTone === "up" ? "bg-[#E5F1EA] text-[#1A7D56]" : "bg-secondary text-muted-foreground";
  return (
    <div className="col-span-12 rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-sm sm:col-span-6 lg:col-span-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
        <span className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${deltaStyle}`}>
          {delta}
        </span>
      </div>
      <div
        className={`mt-3 mb-1 font-mono text-[28px] font-medium tabular-nums leading-none -tracking-tight ${
          valueColor === "success" ? "text-[#1A7D56]" : ""
        }`}
      >
        {value}
      </div>
      <div className="text-[12px] leading-[1.4] text-muted-foreground">{sub}</div>
    </div>
  );
}

function Donut() {
  const gradient =
    "conic-gradient(#16A34A 0deg 58deg, #005840 58deg 158deg, #D1F843 158deg 252deg, #F4C430 252deg 316deg, #5E5C57 316deg 360deg)";
  return (
    <div className="relative mx-auto h-[160px] w-[160px] rounded-full" style={{ background: gradient }}>
      <div className="absolute inset-6 rounded-full bg-card" />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <div className="font-mono text-[24px] font-medium tabular-nums leading-none">14,5t</div>
        <div className="mt-1 font-mono text-[9px] font-medium uppercase tracking-[0.10em] text-muted-foreground">
          4 uker
        </div>
      </div>
    </div>
  );
}

function TierRow({
  color,
  name,
  value,
  warn,
}: {
  color: string;
  name: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      <span className="flex-1 text-[12px] font-medium leading-none">{name}</span>
      <span className="font-mono text-[12px] font-semibold tabular-nums text-foreground">{value}</span>
      {warn ? (
        <span className="rounded-sm bg-[#FFF0D6] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#B8852A]">
          agent
        </span>
      ) : null}
    </div>
  );
}

function HmRow({
  label,
  levels,
  color,
}: {
  label: string;
  levels: number[];
  color: string;
}) {
  const alpha = (lvl: number) => {
    if (lvl === 0) return "rgba(0,0,0,0.04)";
    const a = [0.18, 0.36, 0.58, 0.85][lvl - 1];
    return `${color}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
  };
  return (
    <>
      <div className="flex items-center font-mono text-[10px] font-semibold text-muted-foreground">
        {label}
      </div>
      {levels.map((lvl, i) => (
        <div
          key={i}
          className="aspect-square rounded-[4px] border border-border"
          style={{ background: alpha(lvl) }}
        />
      ))}
    </>
  );
}

function QuickAction({
  icon,
  label,
  primary,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  tone?: "destructive";
}) {
  const cls = primary
    ? "bg-primary text-primary-foreground hover:opacity-90"
    : tone === "destructive"
      ? "border border-border bg-card text-destructive hover:bg-destructive/10"
      : "border border-border bg-card text-foreground hover:bg-secondary";
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${cls}`}
    >
      {icon}
      {label}
    </button>
  );
}
