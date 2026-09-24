/**
 * Forsiden (akgolf.no). OFFENTLIG flate: ingen auth-guard, ingen dataloader.
 *
 * Siden 22.09.2026 (Anders): den mørke, filmatiske forsiden. Tegning:
 * `ui_kits/akgolf-web/hjem-scroll.html` i Claude Design-prosjektet
 * «AK Golf Design System» (87aa23fb).
 *
 * MERK — dette er IKKE en forglemmelse: flaten laster ikke `ak-golf-ds.css`
 * og bærer ingen `.ak-ds`. Tegningen har sin egen palett og står utenfor
 * designsystemets tokenlag. Se toppen av `forside-mork.module.css`.
 *
 * Siden tegner sitt eget skall (topplinje og bunn), og står derfor i
 * `EGET_SKALL` i `(marketing)/layout.tsx` — ellers ville skallet kommet dobbelt.
 */

import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { CSSProperties } from "react";

import { ForsideMork } from "@/components/marketing/ds-sider/ForsideMork";

const plexSans = IBM_Plex_Sans({
  variable: "--font-mork-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mork-meta",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const FONT_KLASSER = `${plexSans.variable} ${plexMono.variable}`;

const FONT_VARS = {
  "--mork-display": "var(--font-mork-display), system-ui, sans-serif",
  "--mork-body": "var(--font-mork-display), system-ui, sans-serif",
  "--mork-meta": "var(--font-mork-meta), ui-monospace, monospace",
} as CSSProperties;

export default function MarketingHjemPage() {
  return (
    <div className={FONT_KLASSER} style={FONT_VARS}>
      <ForsideMork />
    </div>
  );
}
