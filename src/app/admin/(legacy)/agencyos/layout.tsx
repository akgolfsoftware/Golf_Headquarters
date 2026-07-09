import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { AgencyOSTabNav } from "./_tab-nav";

export default async function AgencyOSLayout({ children }: { children: React.ReactNode }) {
  // Fane-raden gir adgang til underrutene (live/uka/spillere/økonomi/caddie).
  // Container matcher cockpitens bredde (mx-auto max-w-[1320px] px-4 sm:px-7).
  // Økonomi + Caddie er ADMIN-only (capability-gate + Anders' «bare deg») —
  // skjul fanene for ikke-ADMIN så de ikke peker på sider som redirecter.
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  return (
    <>
      <div className="mx-auto max-w-[1320px] px-4 pt-4 sm:px-7">
        <AgencyOSTabNav isAdmin={isAdmin} />
      </div>
      {children}
    </>
  );
}
