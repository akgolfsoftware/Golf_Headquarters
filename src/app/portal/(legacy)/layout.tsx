import { PortalShell } from "@/components/portal/portal-shell";

// Legacy-flater under /portal — rendrer PortalShell-chromen (sidebar/topbar/
// BottomNav). Ikke-visuelle providers (Toast/CmdPalette) kommer fra
// src/app/portal/layout.tsx (toppen) — dupliseres ikke her.
export default function PortalLegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell>{children}</PortalShell>;
}
