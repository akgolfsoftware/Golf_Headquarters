// Foreldreportal — v2. Kun auth-guard: hver side leverer sin egen chrome via
// V2Shell (IkonRail/BunnNav med FORELDER_NAV). Beskyttet for kun PARENT-rollen.

import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function ForelderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePortalUser({ allow: ["PARENT"] });

  return <>{children}</>;
}
