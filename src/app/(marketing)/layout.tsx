import { PlausibleScript } from "@/components/marketing/plausible";

// TOPP-layout for markedssidene — kun PlausibleScript, INGEN visuell chrome.
// page.tsx (forside), coaching/, priser/ og playerhq/ er v2-sider som leverer
// sin egen MRamme-chrome (MNav/MFot). Alle andre markedssider ligger i
// (mlegacy) og får gammel MarketingHeader/MarketingFooter-chrome via
// src/app/(marketing)/(mlegacy)/layout.tsx.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PlausibleScript />
      {children}
    </>
  );
}
