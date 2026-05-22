"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Target, BarChart2, Crosshair, Trophy } from "lucide-react";
import "@/components/innsikt/innsikt.css";

// ---------------------------------------------------------------------------
// Tab-definisjon
// ---------------------------------------------------------------------------

type Tab = {
  key: string;
  label: string;
  icon: React.ElementType;
};

const TABS: Tab[] = [
  { key: "mal", label: "Mål", icon: Target },
  { key: "statistikk", label: "Statistikk", icon: BarChart2 },
  { key: "trackman", label: "TrackMan", icon: Crosshair },
  { key: "resultater", label: "Resultater", icon: Trophy },
];

// ---------------------------------------------------------------------------
// Komponent
// ---------------------------------------------------------------------------

export function InnsiktShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const aktiv = searchParams.get("tab") ?? "mal";

  return (
    <div className="in-scope">
      <div className="in-page-wrap">
        {/* Hero */}
        <header className="in-page-head">
          <p className="in-pg-eyebrow">MIN UTVIKLING · INNSIKT</p>
          <h1 className="in-pg-title">
            Innsikt &mdash; <em>mål og fremgang</em>
          </h1>
          <p className="in-pg-sub">
            Resultatmål, statistikk og TrackMan-historikk samlet på ett sted.
          </p>
        </header>

        {/* Tab-bar */}
        <nav className="in-tab-bar" aria-label="Innsikt-faner">
          {TABS.map((tab) => {
            const erAktiv = aktiv === tab.key;
            const href = `${pathname}?tab=${tab.key}`;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.key}
                href={href}
                className={`in-tab${erAktiv ? " active" : ""}`}
                aria-current={erAktiv ? "page" : undefined}
              >
                <Icon />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Tab-innhold */}
        <section aria-label={`Innsikt — ${aktiv}`}>{children}</section>
      </div>
    </div>
  );
}
