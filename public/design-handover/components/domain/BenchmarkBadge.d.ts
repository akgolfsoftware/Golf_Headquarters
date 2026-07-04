import * as React from "react";

export interface BenchmarkBadgeProps {
  /** Nivånavn på stigen, f.eks. "Challenge-nivå", "Kategori A", "Tour". */
  niva: string;
  /** Kontekst-prefiks, f.eks. "Ligger an til". Utelates for statisk nivå. */
  prefiks?: string;
  /** Projeksjon (stiplet, under måling) vs bekreftet nivå. Default "bekreftet". */
  status?: "bekreftet" | "projeksjon";
  size?: "sm" | "md";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Benchmark-badge — plassering på nivåstigen (test-scorekort, spillerkort,
 * leaderboard). Projeksjon = stiplet kant (under måling); bekreftet = solid.
 */
export declare function BenchmarkBadge(props: BenchmarkBadgeProps): JSX.Element;
