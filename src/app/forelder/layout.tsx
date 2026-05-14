// Foreldreportal — shell med sidebar og header.
// Beskyttet for kun PARENT-rollen.

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ForelderSidebar } from "@/components/forelder/sidebar";
import { UserMenu } from "@/components/shared/user-menu";

export default async function ForelderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({ allow: ["PARENT"] });

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#forelder-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Hopp til hovedinnhold
      </a>
      <div className="hidden lg:flex">
        <ForelderSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          role="banner"
          className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-4 sm:px-8 sm:py-4"
        >
          <div
            aria-label="Foreldreportal"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Foreldreportal
          </div>
          <UserMenu name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
        </header>
        <main
          id="forelder-main"
          tabIndex={-1}
          className="flex-1 px-4 py-6 focus:outline-none sm:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
