/**
 * MIDLERTIDIG: den nye forsiden — mørk og filmatisk. Anders' valg 21.09.2026.
 *
 * Tegning: `ui_kits/akgolf-web/hjem-scroll.html` i Claude Design-prosjektet
 * «AK Golf Design System» (87aa23fb). Den lyse varianten av samme innhold
 * ligger på `/forside-ny-lys` så de to kan sammenliknes.
 *
 * MERK: denne flaten laster IKKE `ak-golf-ds.css` og bærer ingen `.ak-ds`.
 * Tegningen har sin egen palett og står utenfor designsystemets tokenlag —
 * se toppen av `forside-mork.module.css`. Det er et valg, ikke en forglemmelse.
 *
 * `noindex` så lenge ruta lever: den er en dublett av forsiden.
 */

import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Oswald } from "next/font/google";
import type { CSSProperties } from "react";

import { ForsideMork } from "@/components/marketing/ds-sider/ForsideMork";

/* Vektene er de tegningen faktisk bruker, ikke hele familiene:
   Oswald 300 (sitatet) og 600 (alt annet display), Archivo 300/400/500,
   IBM Plex Mono 400. Alt annet ville vært nedlastning uten bruk. */
const oswald = Oswald({
  variable: "--font-mork-display",
  weight: ["300", "600"],
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-mork-body",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mork-meta",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

const FONT_KLASSER = `${oswald.variable} ${archivo.variable} ${plexMono.variable}`;

const FONT_VARS = {
  "--mork-display": "var(--font-mork-display), system-ui, sans-serif",
  "--mork-body": "var(--font-mork-body), system-ui, sans-serif",
  "--mork-meta": "var(--font-mork-meta), ui-monospace, monospace",
} as CSSProperties;

export const metadata: Metadata = {
  title: "Forside (mørk) — forhåndsvisning",
  robots: { index: false, follow: false },
};

export default function ForsideNyPage() {
  return (
    <div className={FONT_KLASSER} style={FONT_VARS}>
      <ForsideMork />
    </div>
  );
}
