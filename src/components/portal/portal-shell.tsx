import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { PortalSidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { MobileSidebarDrawer } from "./mobile-sidebar-drawer";
import { PortalGlobalSearchModal } from "./global-search-modal";
import { PortalSearchTriggerButton } from "./search-trigger-button";
import { ProfileMenu } from "@/components/shared/profile-menu";
import { ViewModeToggle } from "@/components/shared/view-mode-toggle";
import { ensurePortalPlayerViewMode } from "@/lib/view-mode";
import { NotificationBell } from "@/components/shared/notification-bell";
import { ToastProvider } from "@/components/shared/toast-provider";
import { CmdPalette } from "@/components/shared/cmd-palette";
import { GuardianConsentBanner } from "./guardian-consent-banner";

export async function PortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // PARENT-rollen tilhører /forelder, ikke /portal.
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "GUEST"] });
  const viewMode = await ensurePortalPlayerViewMode(user.role);

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const varslerUlest = await prisma.notification
    .count({ where: { userId: user.id, readAt: null } })
    .catch(() => 0);

  // S-13: hent aktiv guardian-invitasjon for banner (defence-in-depth)
  const awaitingConsent = isAwaitingGuardianConsent(user);
  const pendingInvitasjonEmail = awaitingConsent
    ? (
        await prisma.parentInvitation
          .findFirst({
            where: { playerId: user.id, acceptedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: "desc" },
            select: { email: true },
          })
          .catch(() => null)
      )?.email ?? null
    : null;

  return (
    <ToastProvider>
    <div className="flex min-h-screen min-h-dvh bg-background">
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Hopp til hovedinnhold
      </a>
      <div className="hidden md:flex">
        <PortalSidebar tier={user.tier} varslerUlest={varslerUlest} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          role="banner"
          className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2 sm:gap-4 sm:px-8 sm:py-4"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <MobileSidebarDrawer
              tier={user.tier}
              varslerUlest={varslerUlest}
            />
            <div
              aria-label="PlayerHQ"
              className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
            >
              PlayerHQ
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <PortalSearchTriggerButton />
            {(user.role === "ADMIN" || user.role === "COACH") && (
              <div className="hidden md:block">
                <ViewModeToggle current={viewMode} />
              </div>
            )}
            <NotificationBell
              notifications={notifications}
              basePath="/portal/varsler"
            />
            <ProfileMenu
              name={user.name}
              email={user.email}
              avatarUrl={user.avatarUrl}
              hcp={user.hcp ?? null}
            />
          </div>
        </header>
        {/* S-13: vis banner hvis bruker venter på foreldresamtykke (defence-in-depth) */}
        {awaitingConsent && (
          <GuardianConsentBanner pendingInvitationEmail={pendingInvitasjonEmail} />
        )}
        <main
          id="portal-main"
          tabIndex={-1}
          className="flex-1 px-4 py-4 pb-24 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 sm:px-8 sm:py-6 md:pb-6"
        >
          {children}
        </main>
      </div>
      <BottomNav />
      <PortalGlobalSearchModal
        canSwitchToCoach={user.role === "ADMIN" || user.role === "COACH"}
      />
      <CmdPalette />
    </div>
    </ToastProvider>
  );
}
