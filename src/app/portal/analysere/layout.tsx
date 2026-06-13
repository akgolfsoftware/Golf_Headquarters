/**
 * Layout for /portal/analysere — full-bredde Analytics Workbench.
 * Fjerner portal-shell slik at Workbench-rammen fyller hele viewport.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Workbench · AK Golf",
  description: "Analyse-senter for trening, runder, tester og TrackMan",
};

export default function AnalysereLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-background">
      {children}
    </div>
  );
}
