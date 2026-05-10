import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminSidebar } from "./sidebar";
import { UserMenu } from "@/components/shared/user-menu";

export async function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-8 sm:py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            CoachHQ · {user.role}
          </div>
          <UserMenu name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
