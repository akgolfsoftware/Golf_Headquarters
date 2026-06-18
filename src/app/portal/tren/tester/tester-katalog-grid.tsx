"use client";

/**
 * Hybrid-design testkatalog-grid for /portal/tren/tester.
 *
 * Filter-chips per pyramide-akse (Alle / FYS / TEK / SLAG / SPILL / TURN).
 * 2-kolonners kortgrid: mørkt gradient-header med lime grid-overlay,
 * kategori-chip, testnavn, meta, antall forsøk + evt. badge.
 * Tildelte tester markeres med eget badge.
 *
 * Klient-komponent (filter-state). Bruker CSS-vars for pyramide-farger
 * (aldri hardkodet hex i className — kun via style-prop for pyr-farger).
 */

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Axis } from "@/lib/portal-tester/tester-data";

export type KatalogKort = {
  id: string;
  name: string;
  axis: Axis;
  /** Kort regel-utdrag (første setning av scoringRule). */
  meta: string;
  /** Antall registrerte resultater. */
  attempts: number;
  /** Sist tatt — formatert dato-streng, null hvis aldri. */
  latestDate: string | null;
  href: string;
  /** Tildelt denne spilleren fra coach. */
  tildelt: boolean;
};

const FILTER_TABS: Array<{ id: Axis | "alle"; label: string }> = [
  { id: "alle", label: "Alle" },
  { id: "fys", label: "FYS" },
  { id: "tek", label: "TEK" },
  { id: "slag", label: "SLAG" },
  { id: "spill", label: "SPILL" },
  { id: "turn", label: "TURN" },
];

/** CSS-var per akse — aldri hardkodet hex. */
const PYR_COLOR: Record<Axis, string> = {
  fys: "var(--pyr-fys)",
  tek: "var(--pyr-tek)",
  slag: "var(--pyr-slag)",
  spill: "var(--pyr-spill)",
  turn: "var(--pyr-turn)",
};

/** Norsk label per akse. */
const AXIS_LABEL: Record<Axis, string> = {
  fys: "FYS",
  tek: "TEK",
  slag: "SLAG",
  spill: "SPILL",
  turn: "TURN",
};

function takentLabel(attempts: number): string {
  if (attempts === 0) return "Aldri tatt";
  if (attempts === 1) return "Tatt 1 gang";
  return `Tatt ${attempts} ganger`;
}

export function TesterKatalogGrid({ kort }: { kort: KatalogKort[] }) {
  const [aktiv, setAktiv] = useState<Axis | "alle">("alle");

  const synlige =
    aktiv === "alle" ? kort : kort.filter((k) => k.axis === aktiv);

  return (
    <div>
      {/* Filter-chips */}
      <div
        className="mb-4 flex gap-1.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {FILTER_TABS.map((tab) => {
          const erAktiv = tab.id === aktiv;
          const pyrColor =
            tab.id !== "alle" ? PYR_COLOR[tab.id as Axis] : undefined;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAktiv(tab.id as Axis | "alle")}
              className="flex-shrink-0 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors"
              style={
                erAktiv
                  ? pyrColor
                    ? {
                        background: pyrColor,
                        color:
                          tab.id === "spill"
                            ? "var(--color-accent-foreground)"
                            : "#fff",
                        border: "1px solid transparent",
                      }
                    : {
                        background: "var(--color-foreground)",
                        color: "var(--color-background)",
                        border: "1px solid transparent",
                      }
                  : {
                      background: "var(--color-card)",
                      color: "var(--color-foreground)",
                      border: "1px solid var(--color-border)",
                    }
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Kortgrid */}
      {synlige.length === 0 ? (
        <div className="rounded-[20px] border border-border bg-card px-5 py-8 text-center">
          <p className="font-display text-[17px] font-bold tracking-tight text-foreground">
            Ingen tester
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Ingen tester matcher filteret. Prøv «Alle».
          </p>
          <button
            type="button"
            onClick={() => setAktiv("alle")}
            className="mt-4 rounded-full bg-primary px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-primary-foreground"
          >
            Vis alle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {synlige.map((k) => (
            <TestKort key={k.id} kort={k} />
          ))}
        </div>
      )}

      {/* Ny egendefinert test — dashed CTA */}
      <Link
        href="/portal/tren/tester/ny"
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-border bg-transparent py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
        Ny egendefinert test
      </Link>
    </div>
  );
}

function TestKort({ kort: k }: { kort: KatalogKort }) {
  const pyrColor = PYR_COLOR[k.axis];
  const axisLabel = AXIS_LABEL[k.axis];

  return (
    <Link
      href={k.href}
      className="group overflow-hidden rounded-[14px] border border-border bg-card transition-shadow hover:shadow-md"
    >
      {/* Kortets bildetopp — mørkt gradient med lime rutenett-overlay */}
      <div
        className="relative h-16"
        style={{
          background: "linear-gradient(150deg, #2f5a2c, #0a2417)",
        }}
      >
        {/* Lime grid-overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(209,248,67,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(209,248,67,.28) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            opacity: 0.35,
          }}
        />
        {/* Pyr-farge-stripe langs venstre kant */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 top-0 w-[3px]"
          style={{ background: pyrColor }}
        />
        {/* Kategori-chip nede til venstre */}
        <div className="absolute bottom-2 left-2.5">
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em]"
            style={{
              background: "rgba(0,0,0,.38)",
              color: "var(--pyr-spill)", /* lime */
            }}
          >
            {axisLabel}
          </span>
        </div>
        {/* Tildelt-badge øverst til høyre */}
        {k.tildelt && (
          <div className="absolute right-2 top-2">
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em]"
              style={{
                background: "rgba(0,88,64,.75)",
                color: "var(--pyr-spill)",
              }}
            >
              Tildelt
            </span>
          </div>
        )}
      </div>

      {/* Kortinnhold */}
      <div className="px-3 pb-3 pt-2.5">
        <p className="mb-1 text-[13px] font-semibold leading-[1.3] text-foreground line-clamp-2">
          {k.name}
        </p>
        <p className="mb-1.5 truncate font-mono text-[9.5px] text-muted-foreground">
          {k.meta}
        </p>
        <div className="flex items-center justify-between gap-1">
          <span className="font-mono text-[9px] text-muted-foreground">
            {takentLabel(k.attempts)}
          </span>
          {k.latestDate && k.attempts > 0 && (
            <span
              className="rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold"
              style={{
                background: "rgba(0,88,64,.10)",
                color: "var(--pyr-fys)",
              }}
            >
              {k.latestDate}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
