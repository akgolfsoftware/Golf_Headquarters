import Link from "next/link";

type Props = {
  aktiveSpillere: number;
  dagensTimer: number;
  ubesvarteMeldinger: number;
  ventendeGodkjenninger: number;
};

export function HubKpiStrip({
  aktiveSpillere,
  dagensTimer,
  ubesvarteMeldinger,
  ventendeGodkjenninger,
}: Props) {
  const kpier = [
    {
      label: "Aktive spillere",
      value: String(aktiveSpillere),
      sub: "Siste 30 dager",
      href: "/admin/spillere",
    },
    {
      label: "Dagens timer",
      value: String(dagensTimer),
      sub: dagensTimer === 1 ? "booking" : "bookinger",
      href: "/admin/bookinger",
    },
    {
      label: "Ubesvart",
      value: String(ubesvarteMeldinger),
      sub: ubesvarteMeldinger === 1 ? "melding" : "meldinger",
      href: "/admin/messages",
    },
    {
      label: "Godkjenninger",
      value: String(ventendeGodkjenninger),
      sub: "Venter",
      href: "/admin/approvals",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {kpier.map((k) => (
        <Link
          key={k.label}
          href={k.href}
          className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary active:border-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {k.label}
          </div>
          <div className="mt-1 font-display text-3xl font-semibold tabular-nums text-foreground">
            {k.value}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground group-hover:text-foreground">
            {k.sub}
          </div>
        </Link>
      ))}
    </div>
  );
}
