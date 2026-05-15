import { SubNav } from "@/components/portal/sub-nav";

const ITEMS = [
  { href: "/portal/statistikk",      label: "Oversikt" },
  { href: "/portal/mal",             label: "Mål" },
  { href: "/portal/mal/runder",      label: "Runder" },
  { href: "/portal/mal/statistikk",  label: "Strokes Gained" },
  { href: "/portal/mal/trackman",    label: "TrackMan" },
];

export default function StatistikkLayout({
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
