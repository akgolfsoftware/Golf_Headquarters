import { PortalProviders } from "@/components/portal/portal-providers";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

// TOPP-layout for /portal — auth-guard (Phase 0 security) + providers.
// INGEN visuell chrome (sidebar/topbar/BottomNav).
// v2-migrerte flater eier egen chrome (V2Shell). Legacy får PortalShell via
// src/app/portal/(legacy)/layout.tsx.
//
// Defense in depth: root requires login. Pages still call requirePortalUser
// for role-specific redirects (PARENT → /forelder, etc.).
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePortalUser();
  return <PortalProviders>{children}</PortalProviders>;
}
