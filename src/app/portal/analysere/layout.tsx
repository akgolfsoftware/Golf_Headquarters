/**
 * Layout for /portal/analysere — bruker standard PortalShell (via portal/layout.tsx).
 * Hybrid-design 2026-06-17: mobil-første side innenfor shell-rammen.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyse · AK Golf",
  description: "Strokes Gained, runder, TrackMan og tester",
};

export default function AnalysereLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
