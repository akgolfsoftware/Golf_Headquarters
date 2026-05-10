import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PortalSidebar } from "./sidebar";
import { MobileDrawer } from "./mobile-drawer";
import { UserMenu } from "@/components/shared/user-menu";

export async function PortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser();

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex">
        <PortalSidebar tier={user.tier} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-8 sm:py-4">
          <div className="flex items-center gap-3">
            <MobileDrawer tier={user.tier} />
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              PlayerHQ
            </div>
          </div>
          <UserMenu name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
