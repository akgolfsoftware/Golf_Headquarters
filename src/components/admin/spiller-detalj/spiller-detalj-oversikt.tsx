/**
 * AgencyOS — Spiller-detalj oversikt (/admin/spillere/[id] · Profil-tab).
 * Pixel-port av [historisk fasit, fjernet 2026-07-03] agencyos/components-agency-player-panel.html.
 *
 * Drawer-innholdet fra FASIT gjengitt som in-page oversikt (vi beholder
 * DetailShell + tabs). Fem seksjoner:
 *   1. KPI siste 30 d (økter · timer trent · SG-trend)
 *   2. Mini-pyramide vs plan (akse-barer + target-strek + alarm-row)
 *   3. Uke-oversikt (7 dag-tiles med pyramide-pips)
 *   4. Neste booking (dato-tile + akse-pille)
 *   5. Siste kommunikasjon (3 rader, råd-type-pille)
 *
 * Server-render. Ingen hardkodet hex, ingen emoji (kun lucide). DS-tokens.
 */

import {
  ArrowUpRight,
  CalendarPlus,
  CheckSquare,
  Clock,
  MapPin,
  PenLine,
  Send,
} from "lucide-react";
import Link from "next/link";
import { Sparkline } from "@/components/athletic";
import { cn } from "@/lib/utils";

export type PyrAxis = "fys" | "tek" | "slag" | "spill" | "turn";

export type SpillerDetaljOversiktProps = {
  weekLabel: string;
  kpi: {
    okter: { value: number; plan: number; diff: number };
    timer: { hours: number; delta: number };
    sgTrend: number | null;
    sgTrendLabel: string;
    sgRoundCount: number;
  };
  sgSparkline: number[];
  pyramid: {
    axis: PyrAxis;
    label: string;
    doneHours: number;
    targetHours: number;
    pct: number;
    alarm: boolean;
  }[];
  week: { dow: string; date: number; today: boolean; pips: PyrAxis[] }[];
  nextBooking: {
    dow: string;
    date: number;
    title: string;
    time: string;
    durMin: number;
    location: string | null;
    axis: PyrAxis;
    axisLabel: string;
  } | null;
  comms: {
    id: string;
    initials: string;
    coach: boolean;
    who: string;
    type: string | null;
    preview: string;
    when: string;
  }[];
};

export type SpillerDetaljOversiktConfig = {
  workbenchHref: string;
  meldingHref: string;
  bookHref: string;
  pyramideHref: string;
  fullProfileHref: string;
  innboksHref: string;
};

const axisFill: Record<PyrAxis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const axisPill: Record<PyrAxis, string> = {
  fys: "bg-[var(--color-pyr-fys-track)] text-[var(--pyr-fys)]",
  tek: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  slag: "bg-[var(--color-pyr-slag-track)] text-[var(--pyr-slag)]",
  spill: "bg-[var(--color-pyr-spill-track)] text-primary",
  turn: "bg-destructive/10 text-destructive",
};

/** "14,5 t" / "12" — komma-desimal, dropper trailing ,0. */
function num(v: number, decimals = 0): string {
  const fixed = v.toFixed(decimals);
  return fixed.replace(/\.0$/, "").replace(".", ",");
}

function deltaLabel(v: number, suffix = ""): { text: string; tone: "up" | "dn" | "flat" } {
  if (v > 0) return { text: `+${num(v, suffix ? 1 : 0)}${suffix}`, tone: "up" };
  if (v < 0) return { text: `−${num(Math.abs(v), suffix ? 1 : 0)}${suffix}`, tone: "dn" };
  return { text: `±0${suffix}`, tone: "flat" };
}

/** Mono-caps seksjon-label med valgfri høyre-lenke. */
function SectionLabel({ children, link }: { children: React.ReactNode; link?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {children}
      </span>
      {link && <span className="ml-auto">{link}</span>}
    </div>
  );
}

function deltaToneClass(tone: "up" | "dn" | "flat"): string {
  return tone === "up" ? "text-success" : tone === "dn" ? "text-destructive" : "text-muted-foreground";
}

// ── KPI 30 d ────────────────────────────────────────────────────
function KpiSection({ kpi, sgSparkline }: { kpi: SpillerDetaljOversiktProps["kpi"]; sgSparkline: number[] }) {
  const okterD = deltaLabel(kpi.okter.diff);
  const timerD = deltaLabel(kpi.timer.delta, " t");
  const sgTone: "up" | "dn" | "flat" =
    kpi.sgTrend == null ? "flat" : kpi.sgTrend > 0 ? "up" : kpi.sgTrend < 0 ? "dn" : "flat";
  const sgValClass =
    sgTone === "up" ? "text-success" : sgTone === "dn" ? "text-destructive" : "text-foreground";

  return (
    <section className="rounded-xl border border-border bg-card p-3.5">
      <SectionLabel>SISTE 30 DAGER</SectionLabel>
      <div className="grid grid-cols-3 gap-2.5">
        {/* Økter */}
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-background px-3 py-2.5">
          <span className="font-mono text-lg font-extrabold leading-none tabular-nums text-foreground">
            {kpi.okter.value}
          </span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            ØKTER
          </span>
          <span className={cn("font-mono text-[9px] font-bold tracking-[0.04em]", deltaToneClass(okterD.tone))}>
            {okterD.text} vs plan
          </span>
        </div>
        {/* Timer trent */}
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-background px-3 py-2.5">
          <span className="font-mono text-lg font-extrabold leading-none tabular-nums text-foreground">
            {num(kpi.timer.hours, 1)} t
          </span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            TIM. TRENT
          </span>
          <span className={cn("font-mono text-[9px] font-bold tracking-[0.04em]", deltaToneClass(timerD.tone))}>
            {timerD.text}
          </span>
        </div>
        {/* SG-trend */}
        <div className="relative flex flex-col gap-1 overflow-hidden rounded-lg border border-border bg-background px-3 py-2.5">
          <span className={cn("font-mono text-lg font-extrabold leading-none tabular-nums", sgValClass)}>
            {kpi.sgTrendLabel}
          </span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            SG-TREND
          </span>
          <span className="font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
            {kpi.sgRoundCount > 0 ? `${kpi.sgRoundCount} runder` : "ingen runder"}
          </span>
          {sgSparkline.length >= 2 && (
            <div className="pointer-events-none absolute bottom-2 right-2 h-5 w-12 opacity-50">
              <Sparkline
                values={sgSparkline}
                width={48}
                height={20}
                color={
                  sgTone === "up"
                    ? "hsl(var(--success))"
                    : sgTone === "dn"
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--muted-foreground))"
                }
                className="h-5 w-12"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Mini-pyramide vs plan ───────────────────────────────────────
function PyramidSection({
  pyramid,
  weekLabel,
  pyramideHref,
}: {
  pyramid: SpillerDetaljOversiktProps["pyramid"];
  weekLabel: string;
  pyramideHref: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-3.5">
      <SectionLabel
        link={
          <Link
            href={pyramideHref}
            className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary hover:underline"
          >
            SE FULL ›
          </Link>
        }
      >
        PYRAMIDE · {weekLabel} / PLAN
      </SectionLabel>
      {pyramid.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
          Ingen plan-økter denne uka.
        </p>
      ) : (
        <div className="flex flex-col gap-[5px]">
          {pyramid.map((r) => {
            // target-strek: planlagt mål er 100 % av planen for aksen → strek på 100 %
            // (eller på faktisk pct hvis under). Vi tegner mål-strek på 100 %.
            return (
              <div key={r.axis} className="grid grid-cols-[34px_1fr_64px] items-center gap-2">
                <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-foreground">
                  {r.label}
                </span>
                <div className="relative h-2 overflow-hidden rounded-full bg-[hsl(var(--foreground)/0.06)]">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      axisFill[r.axis],
                      r.alarm && "shadow-[0_0_0_1px_hsl(var(--destructive))]",
                    )}
                    style={{ width: `${r.pct}%` }}
                  />
                  <span className="absolute -inset-y-0.5 right-0 w-px bg-muted-foreground" />
                </div>
                <span
                  className={cn(
                    "text-right font-mono text-[10px] font-bold tabular-nums",
                    r.alarm ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {num(r.doneHours, 1)} / {num(r.targetHours, r.targetHours % 1 === 0 ? 0 : 1)} t
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Uke-oversikt ────────────────────────────────────────────────
function WeekSection({
  week,
  weekLabel,
  workbenchHref,
}: {
  week: SpillerDetaljOversiktProps["week"];
  weekLabel: string;
  workbenchHref: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-3.5">
      <SectionLabel
        link={
          <Link
            href={workbenchHref}
            className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary hover:underline"
          >
            ÅPNE I WORKBENCH ›
          </Link>
        }
      >
        {weekLabel} · MAN → SØN
      </SectionLabel>
      <div className="grid grid-cols-7 gap-1">
        {week.map((d) => {
          const empty = d.pips.length === 0;
          return (
            <div
              key={`${d.dow}-${d.date}`}
              className={cn(
                "flex min-h-[78px] flex-col items-center gap-1.5 rounded-md border px-1 pb-2 pt-1.5",
                d.today
                  ? "border-accent bg-accent/10"
                  : empty
                    ? "border-transparent bg-transparent"
                    : "border-border bg-background",
              )}
            >
              <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                {d.dow}
              </span>
              <span
                className={cn(
                  "font-mono text-xs font-extrabold leading-none tabular-nums",
                  d.today ? "text-primary" : "text-foreground",
                )}
              >
                {String(d.date).padStart(2, "0")}
              </span>
              <div className="flex w-full flex-col items-center gap-[3px]">
                {d.pips.map((axis, i) => (
                  <span key={i} className={cn("h-1 w-3.5 rounded-sm", axisFill[axis])} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Neste booking ───────────────────────────────────────────────
function NextBookingSection({
  booking,
  bookHref,
}: {
  booking: SpillerDetaljOversiktProps["nextBooking"];
  bookHref: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-3.5">
      <SectionLabel>NESTE BOOKING</SectionLabel>
      {booking ? (
        <div className="grid grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5">
          <div className="flex h-11 w-11 flex-col items-center justify-center rounded-lg border border-border bg-card">
            <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] leading-none text-muted-foreground">
              {booking.dow}
            </span>
            <span className="mt-0.5 font-display text-base font-bold leading-none tracking-[-0.02em] text-foreground">
              {booking.date}
            </span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold tracking-[-0.005em] text-foreground">
              {booking.title}
            </div>
            <div className="mt-1 inline-flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden />
                {booking.time} · {booking.durMin} m
              </span>
              {booking.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden />
                  {booking.location}
                </span>
              )}
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
              axisPill[booking.axis],
            )}
          >
            {booking.axisLabel}
          </span>
        </div>
      ) : (
        <Link
          href={bookHref}
          className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary hover:bg-secondary"
        >
          <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Book time
        </Link>
      )}
    </section>
  );
}

// ── Siste kommunikasjon ─────────────────────────────────────────
function CommSection({
  comms,
  innboksHref,
}: {
  comms: SpillerDetaljOversiktProps["comms"];
  innboksHref: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-3.5">
      <SectionLabel
        link={
          <Link
            href={innboksHref}
            className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary hover:underline"
          >
            ÅPNE TRÅD ›
          </Link>
        }
      >
        SISTE KOMMUNIKASJON
      </SectionLabel>
      {comms.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
          Ingen registrert kommunikasjon.
        </p>
      ) : (
        <div>
          {comms.map((c, idx) => (
            <div
              key={c.id}
              className={cn(
                "grid grid-cols-[28px_1fr_auto] items-start gap-2.5 rounded-md px-2 py-2.5 hover:bg-secondary",
                idx > 0 && "rounded-none border-t border-border",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[10px] font-bold",
                  c.coach ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                )}
              >
                {c.initials}
              </span>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[-0.005em] text-foreground">
                  {c.who}
                  {c.type && (
                    <span className="rounded-[3px] bg-accent/30 px-1.5 py-px font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-primary">
                      {c.type}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-[11px] leading-snug text-muted-foreground">
                  {c.preview}
                </span>
              </div>
              <span className="shrink-0 font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                {c.when}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Handlinger (footer-rad) ─────────────────────────────────────
function ActionFooter({ config }: { config: SpillerDetaljOversiktConfig }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3">
      <div className="flex gap-2">
        <Link
          href={config.workbenchHref}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-primary-foreground hover:opacity-90"
        >
          <ArrowUpRight className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
          Åpne i Workbench
        </Link>
        <Link
          href={config.meldingHref}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-foreground hover:bg-secondary"
        >
          <Send className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
          Send melding
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <Link
          href={config.fullProfileHref}
          className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <PenLine className="h-[11px] w-[11px]" strokeWidth={1.75} aria-hidden />
          Notat
        </Link>
        <Link
          href={config.fullProfileHref}
          className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <CheckSquare className="h-[11px] w-[11px]" strokeWidth={1.75} aria-hidden />
          Oppgave
        </Link>
        <Link
          href={config.bookHref}
          className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <CalendarPlus className="h-[11px] w-[11px]" strokeWidth={1.75} aria-hidden />
          Book
        </Link>
        <span className="flex-1" />
        <Link
          href={config.fullProfileHref}
          className="font-mono text-[10px] font-bold text-primary underline underline-offset-[3px] hover:opacity-80"
        >
          Komplett profil
        </Link>
      </div>
    </div>
  );
}

export function SpillerDetaljOversikt({
  data,
  config,
}: {
  data: SpillerDetaljOversiktProps;
  config: SpillerDetaljOversiktConfig;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <KpiSection kpi={data.kpi} sgSparkline={data.sgSparkline} />
        <PyramidSection pyramid={data.pyramid} weekLabel={data.weekLabel} pyramideHref={config.pyramideHref} />
        <WeekSection week={data.week} weekLabel={data.weekLabel} workbenchHref={config.workbenchHref} />
      </div>
      <div className="space-y-4">
        <NextBookingSection booking={data.nextBooking} bookHref={config.bookHref} />
        <CommSection comms={data.comms} innboksHref={config.innboksHref} />
        <ActionFooter config={config} />
      </div>
    </div>
  );
}
