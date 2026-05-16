import { SubNav } from "@/components/portal/sub-nav";

const ITEMS = [
  { href: "/portal/mal", label: "Oversikt" },
  { href: "/portal/mal/runder", label: "Runder" },
  { href: "/portal/mal/statistikk", label: "Statistikk" },
  { href: "/portal/mal/milepaeler", label: "Milepæler" },
  { href: "/portal/mal/trackman", label: "TrackMan" },
  { href: "/portal/mal/sg-hub", label: "SG Hub" },
  { href: "/portal/mal/baner", label: "Baner" },
  { href: "/portal/mal/leaderboard", label: "Leaderboard" },
];

export default function MalLayout({
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
