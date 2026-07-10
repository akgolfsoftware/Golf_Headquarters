import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

// Legacy-flater under markedsgruppen — rendrer gammel MarketingHeader/
// MarketingFooter-chrome. PlausibleScript ligger i src/app/(marketing)/layout.tsx
// (toppen), som denne gruppen arver.
export default function MarketingLegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
