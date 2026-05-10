import { SubNav } from "@/components/portal/sub-nav";

const ITEMS = [
  { href: "/portal/meg", label: "Profil" },
  { href: "/portal/meg/helse", label: "Helse" },
  { href: "/portal/meg/abonnement", label: "Abonnement" },
  { href: "/portal/meg/innstillinger", label: "Innstillinger" },
  { href: "/portal/meg/dokumenter", label: "Dokumenter" },
  { href: "/portal/meg/help", label: "Hjelp" },
];

export default function MegLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Meg
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Min</em> profil
        </h1>
      </header>

      <SubNav items={ITEMS} />

      <div>{children}</div>
    </div>
  );
}
