import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";

/**
 * PlayerHQ under /portal/(legacy) — V2Shell Paper chrome (erstatter gammel PortalShell).
 * Topp /portal/layout.tsx gir auth + providers uten chrome.
 * Child pages MÅ IKKE wrappe ny V2Shell (dobbel rail/bunn-nav).
 */
export default async function PortalLegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN", "GUEST"],
  });
  return (
    <V2Shell
      bredde="kolonne"
      nav={PLAYERHQ_NAV}
      navn={user.name ?? undefined}
      avatarUrl={user.avatarUrl}
    >
      {children}
    </V2Shell>
  );
}
