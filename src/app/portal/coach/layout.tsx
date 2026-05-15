import { SubNav } from "@/components/portal/sub-nav";

const ITEMS = [
  { href: "/portal/coach",          label: "Oversikt" },
  { href: "/portal/coach/plans",    label: "Planer" },
  { href: "/portal/coach/plans/perioder", label: "Perioder" },
  { href: "/portal/coach/ovelser",  label: "Ovelser" },
  { href: "/portal/coach/melding",  label: "Meldinger" },
  { href: "/portal/onskeligokt",    label: "Onske om okt" },
  { href: "/portal/booking",        label: "Book okt" },
  { href: "/portal/coach/ai",       label: "AI-coach" },
];

export default function CoachLayout({
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
