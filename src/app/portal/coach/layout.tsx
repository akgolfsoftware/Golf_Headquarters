import { SubNav } from "@/components/portal/sub-nav";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

const ITEMS = [
  { href: "/portal/coach", label: "Oversikt" },
  { href: "/portal/coach/plans", label: "Planer" },
  { href: "/portal/coach/melding", label: "Meldinger" },
  { href: "/portal/coach/notes", label: "Notater" },
  { href: "/portal/coach/ai", label: "AI-coach" },
];

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser();
  const visSubNav = user.tier !== "GRATIS";

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Coach
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold italic leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Min</em> coach
        </h1>
      </header>

      {visSubNav && <SubNav items={ITEMS} />}

      <div>{children}</div>
    </div>
  );
}
