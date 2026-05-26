import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "./sidebar";
import { AdminMobileDrawer } from "./mobile-drawer";
import { GlobalSearchModal } from "./global-search-modal";
import { UserMenu } from "@/components/shared/user-menu";
import { ViewModeToggle } from "@/components/shared/view-mode-toggle";
import { NotificationBell } from "@/components/shared/notification-bell";

export async function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="flex min-h-screen min-h-dvh bg-background">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Hopp til hovedinnhold
      </a>
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          role="banner"
          className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-card px-3 sm:h-auto sm:gap-4 sm:px-8 sm:py-4"
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <AdminMobileDrawer />
            <div
              aria-label={`CoachHQ, rolle ${user.role}`}
              className="truncate font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              <span className="hidden sm:inline">CoachHQ · </span>
              {user.role}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <ViewModeToggle current="coach" />
            </div>
            <NotificationBell
              notifications={notifications}
              basePath="/portal/varsler"
            />
            <UserMenu name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
          </div>
        </header>
        <main
          id="admin-main"
          tabIndex={-1}
          className="flex-1 px-4 pb-24 pt-4 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 sm:px-8 sm:py-6 md:pb-6"
        >
          {children}
        </main>
      </div>
      <GlobalSearchModal />
    </div>
  );
}
