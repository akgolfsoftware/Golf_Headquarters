import { PortalProviders } from "@/components/portal/portal-providers";

// TOPP-layout for /portal — INGEN visuell chrome (sidebar/topbar/BottomNav).
// v2-migrerte flater (page.tsx, planlegge/, gjennomfore/, analysere/, meg/,
// (fullscreen)/, (fullscreen-test)/) eier sin egen chrome (V2Shell) eller er
// bevisst chrome-løse. Legacy-flater får PortalShell-chromen via
// src/app/portal/(legacy)/layout.tsx.
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalProviders>{children}</PortalProviders>;
}
