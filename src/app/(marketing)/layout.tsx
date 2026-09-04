import { headers } from "next/headers";
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Condensed,
} from "next/font/google";
import type { CSSProperties, ReactNode } from "react";

import "@/styles/ak-golf.css";
import { PlausibleScript } from "@/components/marketing/plausible";
import { MarkedFot } from "@/components/marketing/landing/MarkedFot";
import { MarkedNav } from "@/components/marketing/landing/MarkedNav";
import { kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";

/**
 * TOPP-layout for markedssidene.
 *
 * Siden 04.09.2026 er fasiten AK Golf-masteren (`designsystem/ak-golf/`,
 * speil av Claude Design-prosjektet 3e5c851c). Layouten laster merkets
 * tokens (`ak-golf.css`) og fonter (IBM Plex-familien) og legger `.ak-marked`
 * rundt innholdet — alt under er merket, ingenting utenfor er det.
 * Spec: docs/superpowers/specs/2026-09-04-marked-ak-golf-port-design.md.
 *
 * Skallet (MarkedNav + MarkedFot) eies fortsatt her — ett skall for alle
 * landingssider (siden 20.08.2026, da fire ulike menyer ble målt på samme
 * nettsted).
 *
 * UNNTAK — flater som tegner sitt eget skall og ville fått DOBBELT her:
 *  - `/stats/*` (~45 ruter): eget produkt, egen mørk MRamme, egen bølge (W7).
 *  - `/booking` KUN når den innebygde bookingen er åpen: Train-lock-flate
 *    (Anders 28.08.2026) med egen topplinje. Pauset booking er en vanlig
 *    landingsside og får skallet.
 */

const plexCondensed = IBM_Plex_Sans_Condensed({
  variable: "--font-ak-display",
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-ak-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-ak-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const FONT_KLASSER = `${plexCondensed.variable} ${plexSans.variable} ${plexMono.variable}`;

/* Masterens type.css setter --ak-display m.fl. med rene fontnavn. Her pekes de
 * til next/font-variablene, så fontene lastes selvhostet og uten layout-hopp. */
const FONT_VARS = {
  "--ak-display":
    "var(--font-ak-display), 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
  "--ak-sans":
    "var(--font-ak-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  "--ak-mono": "var(--font-ak-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
} as CSSProperties;

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
      <div
        className={`ak-marked ${FONT_KLASSER} flex min-h-screen flex-col`}
        style={FONT_VARS}
      >
        <MarkedNav />
        <main className="flex-1">{children}</main>
        <MarkedFot />
      </div>
    </>
  );
}
