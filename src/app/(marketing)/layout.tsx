import { headers } from "next/headers";

import { PlausibleScript } from "@/components/marketing/plausible";
import { MarkedFot } from "@/components/marketing/paper/MarkedFot";
import { MarkedNav } from "@/components/marketing/paper/MarkedNav";

/**
 * TOPP-layout for markedssidene.
 *
 * Siden 20.08.2026 eier denne layouten SKALLET for landingssidene —
 * MarkedNav (med hamburger på mobil) + MarkedFot, ett skall for alle.
 * Fasit: designprosjektet `ak-golf-website`.
 *
 * Før dette hadde marketing FIRE ulike menyer på samme nettsted (målt
 * 20.08.2026): PkShell «katalog», PkShell «side», MRamme og den gamle
 * MarketingHeader. Fra forsiden fantes ikke Coacher/Anlegg/Blogg i menyen;
 * fra /coacher forsvant PlayerHQ/Junior/Om oss. Det er hele grunnen til at
 * skallet er flyttet hit.
 *
 * TO UNNTAK, begge midlertidige:
 *  - `/stats/*` (~45 ruter) er et eget produkt med egen mørk MRamme-ramme og
 *    egen designbølge (W7). De beholder sitt skall til den bølgen kjører.
 *  - `/booking` porteres i neste PR (steg 6–7 i landingssideplanen), sammen
 *    med resten av sidene. Til da beholder den MRamme.
 * Begge ville fått DOBBELT skall om de ikke sto her.
 */

const EGET_SKALL = ["/stats", "/booking"];

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = (await headers()).get("x-pathname") ?? "";
  const harEgetSkall = EGET_SKALL.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (harEgetSkall) {
    return (
      <>
        <PlausibleScript />
        {children}
      </>
    );
  }

  return (
    <>
      <PlausibleScript />
      <div className="flex min-h-screen flex-col bg-mk-bg text-mk-fg">
        <MarkedNav />
        <main className="flex-1">{children}</main>
        <MarkedFot />
      </div>
    </>
  );
}
