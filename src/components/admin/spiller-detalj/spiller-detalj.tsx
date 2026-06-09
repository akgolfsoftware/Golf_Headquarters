/**
 * AgencyOS — Spiller-detalj (DetailShell, coachens inngang til én spiller).
 *
 * Pixel-port FRA design-fasit:
 *   - Visuell fasit (full-page, 2 kolonner): public/design-handover/_screens/ag-spiller.png
 *   - Komponent-/token-referanse: public/design-handover/agencyos/components-agency-player-panel.html
 *     (drawer-varianten gir eksakt styling for header, KPI, mini-pyramide, uke-grid,
 *      booking, kommunikasjon og footer — gjengitt her i fasitens full-page-layout).
 *
 * ★ Delt kjerne: «Åpne i Workbench» (lime CTA + tab) lenker til Workbench-ruten —
 *   samme kjerne coach og spiller deler. Tab-rad: Profil · Plan · Analyse · Tester · Workbench.
 *
 * Layout:
 *   HEADER  — avatar (presence-dot) + navn + gruppe/tier/coach + HCP, status- og alarm-pille,
 *             Rediger / Tildel test til høyre.
 *   TAB-RAD — Profil (aktiv) · Plan · Analyse · Tester · Workbench(↗ lenke).
 *   PROFIL  — 2 kolonner:
 *             venstre  : KPI 30 d (3 tiles) · Mini-pyramide vs plan · Uke-oversikt (7 dag-tiles)
 *             høyre    : Neste booking · Siste kommunikasjon · Workbench-CTA-bar + ghost-rad.
 *
 * Presentasjonell + props-drevet (SpillerDetaljData). Ingen Prisma/DB/auth her.
 * Token-only farger (ingen hardkodet hex), kun lucide-ikoner, norsk bokmål.
 * Subtile tiles bruker bg-secondary (sand-tokenet, prosjektets «cream»-ekvivalent).
 *
 * Responsivt:
 *   Desktop (≥1024px): pixel-nært fasit, 2 kolonner side-om-side.
 *   Mobil (≤640px): hero stabler, tab-rad horisontalt scrollbar m/ fade-edge-hint
 *     (alle 5 faner, inkl. Workbench, scroll-bare), KPI 1-opp, kolonner stables.
 *     Lesbart på 430px.
 */

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  Clock,
  MapPin,
  PencilLine,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionBar } from "./_action-bar";

// ── Typer ───────────────────────────────────────────────────────
type SgTone = "pos" | "neg" | "flat";
type PyrKey = "fys" | "tek" | "slag" | "spill" | "turn";

export type SpillerKpi = {
  label: string;
  value: string;
  /** Fargelegger verdien (SG-trend o.l.). Default: nøytral. */
  tone?: SgTone;
  /** Liten endrings-linje under, f.eks. "−2 vs plan". */
  delta?: { text: string; tone: "up" | "down" | "flat" };
};

export type SpillerPyrRow = {
  key: PyrKey;
  label: string;
  /** Fyllings-prosent 0–100 (andel av target nådd). */
  pct: number;
  /** Target-markør-posisjon 0–100. */
  targetPct: number;
  /** Høyre-kolonne, f.eks. "2,0 / 6 t". */
  value: string;
  /** Markerer raden rød (under target / kritisk). */
  alarm?: boolean;
};

export type SpillerWeekDay = {
  dow: string;
  date: string;
  /** Pyramide-pips for dagen (bekreftede økter). */
  pips: PyrKey[];
  today?: boolean;
};

export type SpillerBooking = {
  dow: string;
  date: string;
  title: string;
  time: string;
  location: string;
  /** Akse-pille, f.eks. "SLAG". */
  axis: { label: string; key: PyrKey };
};

export type SpillerComm = {
  id: string;
  initials: string;
  /** Coach-avatar = forest/lime, ellers sand. */
  coach?: boolean;
  who: string;
  /** Type-pille (GODKJENN/VIDEO osv). `appr` = lime-tonet. */
  type?: { label: string; appr?: boolean };
  preview: string;
  when: string;
};

export type SpillerDetaljData = {
  /** Brukes i lenker: /admin/spillere/[id]/... */
  id: string;
  initials: string;
  name: string;
  /** HCP-verdi, f.eks. "+1,4". */
  hcp: string;
  group: string;
  tier: { label: string; icon?: LucideIcon };
  coachName: string;
  /** Status-pille, f.eks. "Bak plan". */
  status: { label: string; tone: "warn" | "ok" | "alert" };
  /** Alarm-pille (kritisk kontekst). Utelates hvis null. */
  alarm?: string;
  kpiHeading: string;
  kpis: SpillerKpi[];
  pyramidHeading: string;
  pyramid: SpillerPyrRow[];
  weekHeading: string;
  week: SpillerWeekDay[];
  booking: SpillerBooking | null;
  comms: SpillerComm[];
};

// ── Token-mappinger ─────────────────────────────────────────────
const pyrFillClass: Record<PyrKey, string> = {
  fys: "bg-[var(--pyr-fys)]",
  tek: "bg-[var(--pyr-tek)]",
  slag: "bg-[var(--pyr-slag)]",
  spill: "bg-[var(--pyr-spill)]",
  turn: "bg-[var(--pyr-turn)]",
};

const pyrPipClass: Record<PyrKey, string> = pyrFillClass;

const axisChipClass: Record<PyrKey, string> = {
  fys: "bg-[var(--color-pyr-fys-track)] text-[var(--pyr-fys)]",
  tek: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  slag: "bg-[var(--color-pyr-slag-track)] text-[var(--color-info-foreground)]",
  spill: "bg-[var(--color-pyr-spill-track)] text-primary",
  turn: "bg-[var(--color-pyr-turn-track)] text-[var(--pyr-turn)]",
};

const statusToneClass: Record<NonNullable<SpillerDetaljData["status"]>["tone"], string> =
  {
    warn: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)] before:bg-warning",
    ok: "bg-success/10 text-success before:bg-success",
    alert: "bg-destructive/10 text-destructive before:bg-destructive",
  };

const sgValueClass: Record<SgTone, string> = {
  pos: "text-success",
  neg: "text-destructive",
  flat: "text-foreground",
};

const deltaClass: Record<"up" | "down" | "flat", string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

// ── Liten seksjonsetikett (mono-eyebrow + valgfri lenke) ────────
function SectionLabel({
  children,
  link,
}: {
  children: React.ReactNode;
  link?: { label: string; href?: string };
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {children}
      </span>
      {link &&
        (link.href ? (
          <Link
            href={link.href}
            className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary hover:underline"
          >
            {link.label}
            <ArrowRight className="h-3 w-3" strokeWidth={2} aria-hidden />
          </Link>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary">
            {link.label}
            <ArrowRight className="h-3 w-3" strokeWidth={2} aria-hidden />
          </span>
        ))}
    </div>
  );
}

// ── Kort-skall (card-bg, border, rounded) ───────────────────────
function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

// ── HEADER ──────────────────────────────────────────────────────
function DetailHeader({ data }: { data: SpillerDetaljData }) {
  const TierIcon = data.tier.icon ?? Trophy;
  return (
    <header className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Identitet */}
        <div className="flex items-start gap-4">
          <span className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl font-bold tracking-[-0.02em] text-accent">
            {data.initials}
            <span
              className="absolute bottom-px right-0.5 h-3 w-3 rounded-full border-[2.5px] border-card bg-success"
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-foreground">
              {data.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              <span className="rounded-[3px] bg-muted-foreground/10 px-1.5 py-0.5 text-[9px] font-extrabold text-muted-foreground">
                {data.group}
              </span>
              <span className="inline-flex items-center gap-1 rounded-[3px] bg-primary/10 px-1.5 py-0.5 text-[9px] font-extrabold text-primary">
                <TierIcon className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
                {data.tier.label}
              </span>
              <span>HCP {data.hcp}</span>
              <span aria-hidden>·</span>
              <span>COACH {data.coachName}</span>
            </div>
            {/* Status + alarm */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-[22px] items-center gap-1.5 rounded-full pl-2 pr-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] before:h-1.5 before:w-1.5 before:rounded-full before:content-['']",
                  statusToneClass[data.status.tone],
                )}
              >
                {data.status.label}
              </span>
              {data.alarm && (
                <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-destructive/10 px-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-destructive">
                  <AlertTriangle className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
                  {data.alarm}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header-handlinger */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/admin/spillere/${data.id}/rediger`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-secondary"
          >
            <PencilLine className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
            Rediger
          </Link>
          <Link
            href={`/admin/spillere/${data.id}/tildel-test`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-secondary"
          >
            <ClipboardList className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
            Tildel test
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── TAB-RAD ─────────────────────────────────────────────────────
// Profil aktiv (lokal default-fane). Workbench MÅ lenke til workbench-ruten.
// Mobil: relativ wrapper m/ fade-edge til høyre antyder at raden kan scrolles
// (alle 5 faner, inkl. Workbench). Trailing pr-6 hindrer at siste fane klippes
// flush mot kanten. Fade skjules ≥sm (alle faner får plass der).
function TabRow({ id }: { id: string }) {
  const tabs: { label: string; href?: string; active?: boolean }[] = [
    { label: "Profil", active: true },
    { label: "Plan", href: `/admin/spillere/${id}/plan` },
    { label: "Analyse", href: `/admin/analysere?spiller=${id}` },
    { label: "Fremgang", href: `/admin/spillere/${id}/fremgang` },
    { label: "Tester", href: `/admin/spillere/${id}/tester` },
    { label: "Workbench", href: `/admin/spillere/${id}/workbench` },
  ];
  return (
    <div className="relative">
      <nav
        aria-label="Spiller-faner"
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pr-6 [scrollbar-width:none] sm:pr-1 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t) =>
          t.active ? (
            <span
              key={t.label}
              aria-current="page"
              className="relative inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-primary px-4 py-2 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-accent"
            >
              {t.label}
            </span>
          ) : (
            <Link
              key={t.label}
              href={t.href ?? "#"}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t.label === "Workbench" && (
                <ArrowUpRight className="h-3 w-3" strokeWidth={2} aria-hidden />
              )}
              {t.label}
            </Link>
          ),
        )}
      </nav>
      {/* Scroll-hint: fade mot bakgrunn til høyre (kun mobil) */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden"
        aria-hidden
      />
    </div>
  );
}

// ── KPI-tiles (Siste 30 dager) ──────────────────────────────────
function KpiTiles({
  heading,
  kpis,
}: {
  heading: string;
  kpis: SpillerKpi[];
}) {
  return (
    <Panel>
      <SectionLabel>{heading}</SectionLabel>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="flex flex-col gap-1 rounded-lg border border-border bg-secondary px-3 py-2.5"
          >
            <span
              className={cn(
                "font-mono text-lg font-extrabold leading-none tracking-[-0.01em] tabular-nums",
                k.tone ? sgValueClass[k.tone] : "text-foreground",
              )}
            >
              {k.value}
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              {k.label}
            </span>
            {k.delta && (
              <span
                className={cn(
                  "font-mono text-[9px] font-bold tracking-[0.04em]",
                  deltaClass[k.delta.tone],
                )}
              >
                {k.delta.text}
              </span>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ── Mini-pyramide vs plan ───────────────────────────────────────
function MiniPyramid({
  heading,
  rows,
  id,
}: {
  heading: string;
  rows: SpillerPyrRow[];
  id: string;
}) {
  return (
    <Panel>
      <SectionLabel link={{ label: "Se full", href: `/admin/spillere/${id}/plan` }}>
        {heading}
      </SectionLabel>
      <div className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div
            key={r.key}
            className="grid grid-cols-[34px_1fr_56px] items-center gap-2"
          >
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-foreground">
              {r.label}
            </span>
            <div
              className={cn(
                "relative h-2 overflow-hidden rounded-full bg-[rgba(10,31,23,0.06)]",
                r.alarm && "ring-1 ring-destructive",
              )}
            >
              <div
                className={cn("absolute inset-y-0 left-0 rounded-full", pyrFillClass[r.key])}
                style={{ width: `${r.pct}%` }}
              />
              <div
                className="absolute -inset-y-0.5 w-px bg-muted-foreground"
                style={{ left: `${r.targetPct}%` }}
                aria-hidden
              />
            </div>
            <span
              className={cn(
                "text-right font-mono text-[10px] font-bold tabular-nums",
                r.alarm ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ── Uke-oversikt (7 dag-tiles m/ pyramide-pips) ─────────────────
function WeekGrid({
  heading,
  week,
  id,
}: {
  heading: string;
  week: SpillerWeekDay[];
  id: string;
}) {
  return (
    <Panel>
      <SectionLabel
        link={{ label: "Åpne i Workbench", href: `/admin/spillere/${id}/workbench` }}
      >
        {heading}
      </SectionLabel>
      <div className="grid grid-cols-7 gap-1">
        {week.map((d) => (
          <div
            key={d.dow + d.date}
            className={cn(
              "flex min-h-[78px] flex-col items-center gap-1.5 rounded-md border px-1 pb-2 pt-1.5",
              d.today
                ? "border-accent bg-accent/10"
                : "border-border bg-secondary",
            )}
          >
            <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              {d.dow}
            </span>
            <span
              className={cn(
                "font-mono text-xs font-extrabold leading-none tracking-[-0.01em] tabular-nums",
                d.today ? "text-primary" : "text-foreground",
              )}
            >
              {d.date}
            </span>
            <div className="flex w-full flex-col items-center gap-[3px]">
              {d.pips.map((p, i) => (
                <span
                  key={`${p}-${i}`}
                  className={cn("h-1 w-3.5 rounded-sm", pyrPipClass[p])}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ── Neste booking ───────────────────────────────────────────────
function NextBooking({ booking }: { booking: SpillerBooking | null }) {
  return (
    <Panel>
      <SectionLabel>NESTE BOOKING</SectionLabel>
      {booking ? (
        <div className="grid grid-cols-[44px_1fr_auto] items-center gap-x-2.5 rounded-lg border border-border bg-secondary px-3 py-2.5">
          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-card">
            <span className="font-mono text-[8px] font-extrabold uppercase leading-none tracking-[0.10em] text-muted-foreground">
              {booking.dow}
            </span>
            <span className="mt-0.5 font-display text-base font-extrabold leading-none tracking-[-0.02em] text-foreground">
              {booking.date}
            </span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold tracking-[-0.005em] text-foreground">
              {booking.title}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
                {booking.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
                {booking.location}
              </span>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
              axisChipClass[booking.axis.key],
            )}
          >
            {booking.axis.label}
          </span>
        </div>
      ) : (
        <p className="py-6 text-center text-[13px] text-muted-foreground">
          Ingen kommende booking.
        </p>
      )}
    </Panel>
  );
}

// ── Siste kommunikasjon ─────────────────────────────────────────
function LastComm({ comms, id }: { comms: SpillerComm[]; id: string }) {
  return (
    <Panel>
      <SectionLabel link={{ label: "Åpne tråd", href: `/admin/innboks?spiller=${id}` }}>
        SISTE KOMMUNIKASJON
      </SectionLabel>
      {comms.length > 0 ? (
        <div className="-mx-2 flex flex-col">
          {comms.map((c, i) => (
            <div
              key={c.id}
              className={cn(
                "grid grid-cols-[28px_1fr_auto] items-start gap-x-2.5 rounded-md px-2 py-2.5 hover:bg-secondary",
                i > 0 && "border-t border-border",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[10px] font-bold",
                  c.coach ? "bg-primary text-accent" : "bg-secondary text-foreground",
                )}
              >
                {c.initials}
              </span>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[-0.005em] text-foreground">
                  {c.who}
                  {c.type && (
                    <span
                      className={cn(
                        "rounded-[3px] px-1.5 py-px font-mono text-[8px] font-extrabold uppercase tracking-[0.10em]",
                        c.type.appr
                          ? "bg-accent/30 text-primary"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {c.type.label}
                    </span>
                  )}
                </span>
                <p className="mt-0.5 truncate text-[11px] leading-snug text-muted-foreground">
                  {c.preview}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                {c.when}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-[13px] text-muted-foreground">
          Ingen registrert kommunikasjon.
        </p>
      )}
    </Panel>
  );
}

// ── DetailShell (eksport) ───────────────────────────────────────
export function SpillerDetalj({ data }: { data: SpillerDetaljData }) {
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <DetailHeader data={data} />
      <TabRow id={data.id} />

      {/* PROFIL (aktiv fane) — 2 kolonner på desktop, stablet på mobil */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Venstre kolonne */}
        <div className="flex flex-col gap-5">
          <KpiTiles heading={data.kpiHeading} kpis={data.kpis} />
          <MiniPyramid heading={data.pyramidHeading} rows={data.pyramid} id={data.id} />
          <WeekGrid heading={data.weekHeading} week={data.week} id={data.id} />
        </div>
        {/* Høyre kolonne */}
        <div className="flex flex-col gap-5">
          <NextBooking booking={data.booking} />
          <LastComm comms={data.comms} id={data.id} />
          <ActionBar id={data.id} playerName={data.name} />
        </div>
      </div>
    </div>
  );
}
