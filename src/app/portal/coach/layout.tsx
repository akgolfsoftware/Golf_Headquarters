import { SubNav } from "@/components/portal/sub-nav";

const ITEMS = [
  { href: "/portal/coach",          label: "Oversikt" },
  { href: "/portal/coach/plans",    label: "Planer" },
  { href: "/portal/coach/melding",  label: "Meldinger" },
  { href: "/portal/onskeligokt",    label: "Ønske om økt" },
  { href: "/portal/booking",        label: "Book økt" },
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
