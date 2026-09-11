"use client";

// Ikke-visuelle providers for hele /portal — løftet ut av PortalShell slik at
// v2-migrerte flater (rot-layout) og legacy-flater (PortalShell-chrome) deler
// samme toast-system og cmd-palette uten å dupliseres.
// Wave C: OfflineSyncBootstrap flusher IndexedDB → DB når nett er tilbake.

import { ToastProvider } from "@/components/shared/toast-provider";
import { CmdPalette } from "@/components/shared/cmd-palette";
import { OfflineSyncBootstrap } from "@/components/portal/OfflineSyncBootstrap";
import { LokalDataEierProvider } from "@/lib/offline-queue/eier-context";

export function PortalProviders({
  eierId,
  children,
}: {
  eierId: string;
  children: React.ReactNode;
}) {
  return (
    <LokalDataEierProvider eierId={eierId}>
      <ToastProvider>
        <OfflineSyncBootstrap eierId={eierId} />
        {children}
        <CmdPalette />
      </ToastProvider>
    </LokalDataEierProvider>
  );
}
