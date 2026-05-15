import { SubNav } from "@/components/portal/sub-nav";

const ITEMS = [
  { href: "/portal/meg",                label: "Profil" },
  { href: "/portal/varsler",            label: "Varsler" },
  { href: "/portal/meg/abonnement",     label: "Abonnement" },
  { href: "/portal/meg/innstillinger",  label: "Innstillinger" },
];

export default function MegLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <SubNav items={ITEMS} />
      <div>{children}</div>
    </div>
  );
}
