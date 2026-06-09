"use client";

/**
 * Gjennomføre-faner (ExecuteScreen) — I dag / Kalender / Booking.
 * Default "I dag" matcher fasitens TodayView. Client pga fane-state.
 */

import { useState } from "react";
import Link from "next/link";
import { Sun, Play, ArrowRight, CalendarCheck } from "lucide-react";
import { AthleticBadge } from "@/components/athletic/badge";
import type { GjennomforeData, GjennomforeOkt } from "@/lib/portal-gjennomfore/gjennomfore-data";

const TABS = [
  { key: "idag", label: "I dag" },
  { key: "kalender", label: "Kalender" },
  { key: "booking", label: "Booking" },
] as const;

function OktRad({ o }: { o: GjennomforeOkt }) {
  const chip =
    o.status === "now"
      ? { variant: "lime" as const, label: "Nå" }
      : o.status === "done"
        ? { variant: "ok" as const, label: "Logget" }
        : { variant: "neutral" as const, label: "Kommer" };
  return (
    <Link
      href={o.href}
      className="flex items-center gap-3.5 border-b border-border py-3 last:border-b-0 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="w-[50px] shrink-0 text-right font-mono text-[13px] font-semibold text-foreground">{o.tid}</span>
      <span className={"h-9 w-[3px] shrink-0 rounded-full " + (o.status === "now" ? "bg-accent" : "bg-border")} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold tracking-[-0.005em] text-foreground">{o.tittel}</span>
        <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">{o.meta}</span>
      </span>
      <AthleticBadge variant={chip.variant}>{chip.label}</AthleticBadge>
    </Link>
  );
}

function IDag({ data }: { data: GjennomforeData }) {
  if (data.antall === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Ingen økter planlagt i dag.</p>
        <Link href="/portal/planlegge" className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
          Planlegg i Workbench <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-5">
      {/* Accent-kort: editorial card + lime venstrekant */}
      <div className="mb-4 flex items-center gap-3.5 rounded-2xl border border-border border-l-[3px] border-l-accent bg-card p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-accent">
          <Sun className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold tracking-[-0.01em] text-foreground">
            {data.datoTekst} · {data.antall} {data.antall === 1 ? "økt" : "økter"}
          </div>
          {data.statusTekst && (
            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{data.statusTekst}</div>
          )}
        </div>
        {data.startHref && (
          <Link
            href={data.startHref}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-4 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Play className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            Start nå
          </Link>
        )}
      </div>

      <div>
        {data.okter.map((o) => (
          <OktRad key={o.id} o={o} />
        ))}
      </div>

      <p className="mt-3.5 font-mono text-[11px] text-muted-foreground">
        Endre rekkefølge eller legg til økter i{" "}
        <Link href="/portal/planlegge" className="font-bold text-primary hover:underline">
          Workbench →
        </Link>
      </p>
    </div>
  );
}

function Kalender({ data }: { data: GjennomforeData }) {
  const now = new Date();
  const dag = (now.getDay() + 6) % 7; // 0 = mandag
  const mandag = new Date(now);
  mandag.setDate(now.getDate() - dag);
  const navn = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  const dager = navn.map((n, i) => {
    const d = new Date(mandag);
    d.setDate(mandag.getDate() + i);
    return { n, dato: d.getDate(), erIdag: i === dag };
  });
  return (
    <div className="mt-5 space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {dager.map((d) => (
          <div
            key={d.n}
            className={
              "rounded-xl py-2.5 text-center " +
              (d.erIdag ? "bg-primary text-accent" : "border border-border bg-card text-foreground")
            }
          >
            <div className="font-mono text-[9px] font-bold uppercase opacity-70">{d.n}</div>
            <div className="mt-1 font-display text-lg font-bold">{d.dato}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          I dag
        </div>
        {data.okter.length > 0 ? (
          data.okter.map((o) => <OktRad key={o.id} o={o} />)
        ) : (
          <p className="py-4 text-sm text-muted-foreground">Ingen økter i dag.</p>
        )}
      </div>
    </div>
  );
}

const BOOKING_TYPER = [
  { tittel: "Pro-time", meta: "1:1 med coach · 60 min" },
  { tittel: "TrackMan-bay", meta: "Innendørs · 60 min" },
  { tittel: "Tee-time", meta: "Bana · 18 hull" },
  { tittel: "Gruppe-clinic", meta: "Junior · 90 min" },
];

function Booking() {
  return (
    <div className="mt-5 space-y-4">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Hva vil du booke?
      </div>
      <div className="grid gap-2.5">
        {BOOKING_TYPER.map((b) => (
          <Link
            key={b.tittel}
            href="/portal/booking"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              <CalendarCheck className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">{b.tittel}</span>
              <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{b.meta}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={2} aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function GjennomforeFaner({ data }: { data: GjennomforeData }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("idag");
  return (
    <div>
      {/* Fane-rad: underline-aktiv */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "relative -mb-px mr-4 px-1 py-3 text-sm font-semibold tracking-[-0.01em] transition-colors " +
              (tab === t.key
                ? "text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "idag" && <IDag data={data} />}
      {tab === "kalender" && <Kalender data={data} />}
      {tab === "booking" && <Booking />}
    </div>
  );
}
