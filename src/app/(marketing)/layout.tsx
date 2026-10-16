import { headers } from "next/headers";
import type { ReactNode } from "react";

import "@/styles/ak-golf.css";
import "@/styles/precision-athletics.css";
import "@/styles/marked-precision.css";
import { PlausibleScript } from "@/components/marketing/plausible";
import { MarkedFot } from "@/components/marketing/landing/MarkedFot";
import { MarkedNav } from "@/components/marketing/landing/MarkedNav";
import { kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";

/**
 * TOPP-layout for markedssidene.
 *
 * Siden 04.10.2026 er fasiten «AK Golf Precision Athletics» (samme system som
 * PlayerHQ og AgencyOS), ikke lenger «verksted»-merket. Layouten legger
 * `.pa-root` (Precision-tokens) sammen med `.ak-marked`; `marked-precision.css`
 * peker de arvede --ak-*-navnene til Precision-verdiene. Skriftene
 * (IBM Plex Sans og Mono) kommer fra rot-layouten.
 *
 * Skallet (MarkedNav + MarkedFot) eies her — ett skall for alle landingssider.
 *
 * UNNTAK — flater som tegner sitt eget skall og ville fått DOBBELT her:
 *  - `/stats/*` (~45 ruter): eget produkt, egen mørk MRamme, egen bølge (W7).
 *  - `/booking` KUN når den innebygde bookingen er åpen (egen topplinje,
 *    håndteres separat). Pauset booking er en vanlig landingsside og får skallet.
 */

const EGET_SKALL = ["/stats"];

export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const path = (await headers()).get("x-pathname") ?? "";
  const erBookingFlate = path === "/booking" || path.startsWith("/booking/");
  const harEgetSkall =
    EGET_SKALL.some((p) => path === p || path.startsWith(`${p}/`)) ||
    // Bookingflatene tegner eget skall først når bookingen faktisk er åpen.
    (erBookingFlate && (await kanBrukeInnebygdBooking()));

  if (harEgetSkall) {
    // Eget skall: ingen .ak-marked. Skriftene kommer fra rot-layouten.
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
      <div className="pa-root ak-marked flex min-h-screen flex-col">
        <MarkedNav />
        <main className="flex-1">{children}</main>
        <MarkedFot />
      </div>
    </>
  );
}
