import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/**
 * Layout for interne sider — design-system, demoer, pilot-sider.
 *
 * Kun ADMIN-rolle slipper inn. Beta-spillere, foreldre og coacher
 * sendes til riktig hjem av requirePortalUser.
 */
export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Kun ADMIN-rolle kan se interne sider/demoer
  await requirePortalUser({ allow: ["ADMIN"] });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-amber-500/30 bg-amber-50 px-4 py-2 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-900">
        INTERN — KUN UTVIKLING · {process.env.NODE_ENV}
      </div>
      {children}
    </div>
  );
}
