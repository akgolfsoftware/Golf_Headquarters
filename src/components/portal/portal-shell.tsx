import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PortalSidebar } from "./sidebar";
import { UserMenu } from "@/components/shared/user-menu";

export async function PortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser();

  return (
    <div className="flex min-h-screen bg-background">
      <PortalSidebar tier={user.tier} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-8 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            PlayerHQ
          </div>
          <UserMenu name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
