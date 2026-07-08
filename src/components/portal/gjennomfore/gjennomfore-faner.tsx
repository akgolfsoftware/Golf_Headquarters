"use client";

/**
 * Gjennomfore — hybrid-design 2026-06-17.
 *
 * Tre seksjoner (ingen faner):
 *   1. Neste økt  — featured forest card med drill-chips + "Start økt"
 *   2. Resten av dagen — kompakte rader med "Start"-knapp
 *   3. Fullført i dag  — rader med check + "Logg"-knapp eller resultat
 */

import Link from "next/link";
import { Play, ArrowRight, Pencil, Check } from "lucide-react";
import { Button, Card, Eyebrow } from "@/components/athletic/golfdata";
import type { GjennomforeData, GjennomforeOkt } from "@/lib/portal-gjennomfore/gjennomfore-data";

// ── Neste økt — featured forest card ──────────────────────────────

function NesteCard({ o }: { o: GjennomforeOkt }) {
  const isActive = o.status === "now";
  const label = isActive
    ? `Pågår · ${o.tid}`
    : `Neste · ${o.tid} · ${o.relTidTekst}`;

  return (
    <div
      className="relative overflow-hidden rounded-[20px] p-[18px] text-white shadow-[0_14px_40px_-12px_rgba(0,88,64,0.45)]"
      style={{ background: "linear-gradient(150deg, #005840, #00402F)" }}
    >
      {/* lime radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-12 h-[190px] w-[190px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(209,248,67,.20), transparent 68%)" }}
      />

      <div className="relative z-10">
        {/* header row */}
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-accent">
            {label}
          </span>
          <span className="whitespace-nowrap rounded-full bg-accent px-2.5 py-1 font-mono text-[11px] font-bold text-accent-foreground">
            {o.varighet} min
          </span>
        </div>

        {/* title */}
        <h2 className="mb-3.5 font-display text-[21px] font-bold leading-tight tracking-[-0.02em]">
          {o.tittel}{" "}
          <em className="font-medium not-italic opacity-75">med {o.coachNavn}</em>
        </h2>

        {/* meta cols */}
        <div className="mb-4 flex gap-[22px]">
          <div>
            <div className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/50">
              Coach
            </div>
            <div className="font-mono text-[14px] font-bold text-white">{o.coachNavn}</div>
          </div>
          <div>
            <div className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/50">
              Sted
            </div>
            <div className="font-mono text-[14px] font-bold text-white">{o.sted}</div>
          </div>
          <div>
            <div className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/50">
              Drills
            </div>
            <div className="font-mono text-[14px] font-bold text-white">{o.antallDrills}</div>
          </div>
        </div>

        {/* drill chips */}
        {o.drillNavn.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {o.drillNavn.slice(0, 3).map((navn) => (
              <span
                key={navn}
                className="rounded-[4px] border border-accent/30 px-[7px] py-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-accent"
              >
                {navn}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link
          href={o.href}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-[13px] font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-accent-foreground transition-opacity hover:opacity-90"
        >
          {isActive ? "Fortsett økt" : "Start økt"}
          <Play className="h-[15px] w-[15px]" fill="currentColor" strokeWidth={0} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

// ── Resten av dagen — kompakt rad ──────────────────────────────────

const PYR_CSS: Record<string, string> = {
  FYS: "var(--pyr-fys)",
  TEK: "var(--pyr-tek)",
  SLAG: "var(--pyr-slag)",
  SPILL: "var(--pyr-spill)",
  TURN: "var(--pyr-turn)",
};

function ResteRad({ o }: { o: GjennomforeOkt }) {
  const borderColor = PYR_CSS[o.pyramidArea] ?? "var(--border)";
  return (
    <Card compact className="mb-[9px] border-l-[3px]" style={{ borderLeftColor: borderColor }}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold text-foreground">{o.tittel}</div>
          <div className="mt-[3px] font-mono text-[10.5px] text-muted-foreground">{o.meta}</div>
        </div>
        <Button
          as={Link}
          href={o.href}
          variant="secondary"
          size="sm"
          iconLeft={<Play className="h-3 w-3" fill="currentColor" strokeWidth={0} aria-hidden />}
        >
          Start
        </Button>
      </div>
    </Card>
  );
}

// ── Fullført i dag — rad ───────────────────────────────────────────

function FullfortRad({ o }: { o: GjennomforeOkt }) {
  return (
    <Card compact className="mb-[9px]">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/14">
          <Check className="h-[13px] w-[13px] text-success" strokeWidth={2.8} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-foreground">{o.tittel}</div>
          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            {o.tid} · {o.varighet} min
          </div>
        </div>
        {o.trengerLogg ? (
          <Button
            as={Link}
            href={`${o.href}?logg=1`}
            variant="secondary"
            size="sm"
            iconLeft={<Pencil className="h-[9px] w-[9px]" strokeWidth={2.5} aria-hidden />}
          >
            Logg
          </Button>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] font-bold text-success whitespace-nowrap">
            <Check className="h-[10px] w-[10px]" strokeWidth={3} aria-hidden />
            Logget
          </span>
        )}
      </div>
    </Card>
  );
}

// ── Tom-tilstand ───────────────────────────────────────────────────

function TomTilstand() {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <p className="text-sm text-muted-foreground">Ingen økter planlagt i dag.</p>
      <Link
        href="/portal/planlegge"
        className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-primary"
      >
        Planlegg i Workbench
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </Link>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────

export function GjennomforeFaner({ data }: { data: GjennomforeData }) {
  const { nesteOkt, resteAvDagen, fullfortIdag, antall, datoTekst, totalMin } = data;

  if (antall === 0) {
    return <TomTilstand />;
  }

  const totalTekst =
    totalMin >= 60
      ? `${Math.floor(totalMin / 60)} t ${totalMin % 60 > 0 ? `${totalMin % 60} min` : ""}`.trim()
      : `${totalMin} min`;

  return (
    <div className="mt-4 space-y-5">
      {/* dato + antall + total */}
      <p className="text-[13px] text-muted-foreground">
        {datoTekst} · {antall} {antall === 1 ? "økt" : "økter"} · {totalTekst} totalt
      </p>

      {/* Neste økt */}
      {nesteOkt && <NesteCard o={nesteOkt} />}

      {/* Resten av dagen */}
      {resteAvDagen.length > 0 && (
        <div>
          <Eyebrow className="mb-[9px] block">Resten av dagen</Eyebrow>
          {resteAvDagen.map((o) => (
            <ResteRad key={o.id} o={o} />
          ))}
        </div>
      )}

      {/* Fullført i dag */}
      {fullfortIdag.length > 0 && (
        <div>
          <Eyebrow className="mb-[9px] block">Fullført i dag</Eyebrow>
          {fullfortIdag.map((o) => (
            <FullfortRad key={o.id} o={o} />
          ))}
        </div>
      )}

    </div>
  );
}
