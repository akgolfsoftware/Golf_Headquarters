"use client";

// Ikke-visuelle providers for hele /portal — løftet ut av PortalShell slik at
// v2-migrerte flater (rot-layout) og legacy-flater (PortalShell-chrome) deler
// samme toast-system og cmd-palette uten å dupliseres.

import { ToastProvider } from "@/components/shared/toast-provider";
import { CmdPalette } from "@/components/shared/cmd-palette";

export function PortalProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <CmdPalette />
    </ToastProvider>
  );
}
