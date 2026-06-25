// Lyst, chrome-løst fullskjerm-lag for test-gjennomføring (scorekort).
// Overstyrer PortalShell — ingen sidebar/header — men beholder PlayerHQ lyst
// (låst regel: PlayerHQ alltid lyst). Skiller seg fra (fullscreen) som er mørkt
// for live-økt-tapperen. Auth skjer i hver page.tsx via requirePortalUser.

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ensurePortalPlayerViewMode } from "@/lib/view-mode";

export default async function FullscreenTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN", "GUEST"],
  });
  await ensurePortalPlayerViewMode(user.role);

  return <div className="min-h-dvh bg-background">{children}</div>;
}
