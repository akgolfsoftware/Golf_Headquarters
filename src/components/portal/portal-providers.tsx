"use client";

// Ikke-visuelle providers for hele /portal — løftet ut av PortalShell slik at
// v2-migrerte flater (rot-layout) og legacy-flater (PortalShell-chrome) deler
// samme toast-system og cmd-palette uten å dupliseres.
// Wave C: OfflineSyncBootstrap flusher IndexedDB → DB når nett er tilbake.

import { ToastProvider } from "@/components/shared/toast-provider";
import { CmdPalette } from "@/components/shared/cmd-palette";
import { OfflineSyncBootstrap } from "@/components/portal/OfflineSyncBootstrap";

export function PortalProviders({
  children,
  userId,
}: {
  children: React.ReactNode;
  /**
   * R-C (2026-09-11): den innloggede brukerens id, sendt ned fra
   * PortalLayout (server). OfflineSyncBootstrap bruker den til å filtrere
   * IndexedDB-køene til KUN denne brukerens rader — se kommentaren der.
   */
  userId: string;
}) {
  return (
    <ToastProvider>
      <OfflineSyncBootstrap userId={userId} />
      {children}
      <CmdPalette />
    </ToastProvider>
  );
}
