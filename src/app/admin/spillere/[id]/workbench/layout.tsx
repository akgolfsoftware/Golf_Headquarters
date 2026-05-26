/**
 * Coach workbench-layout — full-screen, ingen admin-shell.
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
  return <div className="fixed inset-0 z-50 bg-background">{children}</div>;
}
