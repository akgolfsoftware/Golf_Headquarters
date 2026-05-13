import { SubNav } from "@/components/portal/sub-nav";

const ITEMS = [
  { href: "/portal/meg", label: "Profil" },
  { href: "/portal/meg/helse", label: "Helse" },
  { href: "/portal/meg/abonnement", label: "Abonnement" },
  { href: "/portal/meg/innstillinger", label: "Innstillinger" },
  { href: "/portal/meg/foreldre", label: "Foreldre" },
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
      <SubNav items={ITEMS} />
      <div>{children}</div>
    </div>
  );
}
