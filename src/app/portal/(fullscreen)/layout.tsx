// Fullscreen layout for Live Session og andre tapper-moduser.
// Overstyrer PortalShell — ingen sidebar, ingen header.
// Auth-sjekk skjer i hver page.tsx via requirePortalUser.

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ensurePortalPlayerViewMode } from "@/lib/view-mode";

export default async function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN", "GUEST"],
  });
  await ensurePortalPlayerViewMode(user.role);

  return <div className="min-h-dvh bg-foreground">{children}</div>;
}
