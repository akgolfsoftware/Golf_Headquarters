import { SubNav } from "@/components/portal/sub-nav";

const ITEMS = [
  { href: "/portal/mal", label: "Oversikt" },
  { href: "/portal/mal/runder", label: "Runder" },
  { href: "/portal/mal/trackman", label: "TrackMan" },
  { href: "/portal/mal/baner", label: "Baner" },
  { href: "/portal/mal/leaderboard", label: "Leaderboard" },
];

export default function MalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Mål
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Mine</em> mål og resultater
        </h1>
      </header>

      <SubNav items={ITEMS} />

      <div>{children}</div>
    </div>
  );
}
