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
      <SubNav items={ITEMS} />
      <div>{children}</div>
    </div>
  );
}
