import { SubNav } from "@/components/portal/sub-nav";

const ITEMS = [
  { href: "/portal/tren", label: "Plan" },
  { href: "/portal/tren/kalender", label: "Kalender" },
  { href: "/portal/tren/ovelser", label: "Øvelser" },
  { href: "/portal/tren/tester", label: "Tester" },
];

export default function TrenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Tren
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Min</em> trening
        </h1>
      </header>

      <SubNav items={ITEMS} />

      <div>{children}</div>
    </div>
  );
}
