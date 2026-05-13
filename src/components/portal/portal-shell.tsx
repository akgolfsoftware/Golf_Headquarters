import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PortalSidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { UserMenu } from "@/components/shared/user-menu";
import { ViewModeToggle } from "@/components/shared/view-mode-toggle";
import { NotificationBell } from "@/components/shared/notification-bell";

export async function PortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // PARENT-rollen tilhører /forelder, ikke /portal.
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "GUEST"] });

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Hopp til hovedinnhold
      </a>
      <div className="hidden lg:flex">
        <PortalSidebar tier={user.tier} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          role="banner"
          className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-8 sm:py-4"
        >
          <div className="flex items-center gap-3">
            <div
              aria-label="PlayerHQ"
              className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              PlayerHQ
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(user.role === "ADMIN" || user.role === "COACH") && (
              <ViewModeToggle current="player" />
            )}
            <NotificationBell
              notifications={notifications}
              basePath="/portal/varsler"
            />
            <UserMenu name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
          </div>
        </header>
        <main
          id="portal-main"
          tabIndex={-1}
          className="flex-1 px-4 py-6 pb-24 focus:outline-none sm:px-8 lg:pb-6"
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
