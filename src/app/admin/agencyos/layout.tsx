import { AgencyOSTabNav } from "./_tab-nav";

export default function AgencyOSLayout({ children }: { children: React.ReactNode }) {
  // Fane-raden gir adgang til underrutene (live/uka/spillere/økonomi/caddie).
  // Container matcher cockpitens bredde (mx-auto max-w-[1320px] px-4 sm:px-7).
  return (
    <>
      <div className="mx-auto max-w-[1320px] px-4 pt-4 sm:px-7">
        <AgencyOSTabNav />
      </div>
      {children}
    </>
  );
}
