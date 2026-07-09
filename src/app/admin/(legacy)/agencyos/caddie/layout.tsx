import { CaddieSubNav } from "./_caddie-subnav";

/**
 * Caddie-skjermen samler tre visninger under én sub-nav:
 * Samtale (chat) · Dashbord (co-agent) · Aktivitet (tidslinje).
 * ADMIN-gating skjer på hver underside + den skjulte fanen (Anders' «bare deg»).
 */
export default function CaddieLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-8 pt-4 sm:px-7">
      <CaddieSubNav />
      {children}
    </div>
  );
}
