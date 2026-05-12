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
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Hopp til hovedinnhold
      </a>
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          role="banner"
          className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-8 sm:py-4"
        >
          <div
            aria-label={`CoachHQ, rolle ${user.role}`}
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            CoachHQ · {user.role}
          </div>
          <UserMenu name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
        </header>
        <main
          id="admin-main"
          tabIndex={-1}
          className="flex-1 px-4 py-6 focus:outline-none sm:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
