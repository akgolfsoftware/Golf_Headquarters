/**
 * Layout for /portal/planlegge/workbench — full-bredde uten portal-shell.
 * Workbench Plan A trenger 100vw × 100vh for å vise alle paneler.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workbench · Plan A — AK Golf",
  description: "Plan-kommandosenter for periodiserte treningsplaner",
};

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="fixed inset-0 z-50 bg-background">{children}</div>;
}
