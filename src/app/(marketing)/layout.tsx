import { headers } from "next/headers";

import { PlausibleScript } from "@/components/marketing/plausible";
import { MarkedFot } from "@/components/marketing/landing/MarkedFot";
import { MarkedNav } from "@/components/marketing/landing/MarkedNav";
import { kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";

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
 * UNNTAK — flater som tegner sitt eget skall og ville fått DOBBELT her:
 *  - `/stats/*` (~45 ruter): eget produkt, egen mørk MRamme, egen designbølge
 *    (W7). Beholder sitt skall til den bølgen kjører.
 *  - `/booking` KUN når den innebygde bookingen er åpen: da rendres
 *    `MarkedBookingV2`, som har egen topplinje fordi fasiten
 *    `designsystem/paper/fase1/booking.html` tegner en — pixel-signert av
 *    Anders 14.08.2026. Er bookingen pauset (dagens tilstand for alle utenom
 *    ADMIN), er `/booking` en helt vanlig landingsside og får skallet.
 *    Åpen sak: fasitens egen topplinje er et skall-monopol-brudd. Den ble
 *    signert før landingssidene fikk ett felles skall, og bør enten rettes i
 *    designprosjektet eller bekreftes som bevisst unntak — Anders' avgjørelse.
 *  - Bookingens undersider (`/booking/[slug]`, `…/bekreft`, `…/kvittering`)
 *    bruker fortsatt MRamme og er derfor mørke. De er kun nåbare når
 *    bookingen er åpen, og porteres når den åpnes.
 */

const EGET_SKALL = ["/stats"];

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = (await headers()).get("x-pathname") ?? "";
  const erBookingFlate = path === "/booking" || path.startsWith("/booking/");
  const harEgetSkall =
    EGET_SKALL.some((p) => path === p || path.startsWith(`${p}/`)) ||
    // Bookingflatene tegner eget skall først når bookingen faktisk er åpen.
    (erBookingFlate && (await kanBrukeInnebygdBooking()));

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
