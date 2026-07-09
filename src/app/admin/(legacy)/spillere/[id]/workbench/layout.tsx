/**
 * Coach workbench-layout.
 * Desktop (md+): full-screen overlay (fixed inset-0 z-50).
 * Mobil (<md): normal page-flow inni AdminShell (full WorkbenchHybrid).
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workbench (Coach) — AK Golf",
};

export default function CoachWorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:fixed md:inset-0 md:z-50 md:bg-background">
      {children}
    </div>
  );
}
