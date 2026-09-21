/**
 * MIDLERTIDIG: den nye forsiden, bygget på AK Golf Design System
 * (Claude Design 87aa23fb — dagens designautoritet, 21.09.2026).
 *
 * Anders ser denne mot `/` (Reisen) og `/forside-ak` (eldre merkesystem) og
 * velger. Velges denne, byttes `(marketing)/page.tsx` til `ForsideDS`, og de
 * tre gamle forsidene slettes sammen med denne ruta.
 *
 * `noindex` så lenge ruta lever: den er en dublett av forsiden.
 *
 * Fontene lastes her, ikke i layouten: designsystemet har tre familier
 * (Oswald display, Archivo brødtekst, IBM Plex Mono måledata), og
 * `designsystem/ak-golf-ds/tokens/fonts.css` — som ville hentet dem fra
 * Google med @import — er bevisst holdt utenfor speilet.
 */

import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Oswald } from "next/font/google";
import type { CSSProperties } from "react";

import "@/styles/ak-golf-ds.css";
import { ForsideDS } from "@/components/marketing/ds-sider/ForsideDS";

const oswald = Oswald({
  variable: "--font-ds-display",
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-ds-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-ds-meta",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const FONT_KLASSER = `${oswald.variable} ${archivo.variable} ${plexMono.variable}`;

/* Tokenlaget setter --font-display m.fl. med rene fontnavn. Her pekes de til
 * next/font-variablene, så fontene lastes selvhostet og uten layout-hopp.
 * next/font lager sine egne målte reservefamilier — masterens «Oswald
 * Fallback» trengs derfor ikke. */
const FONT_VARS = {
  "--font-display": "var(--font-ds-display), system-ui, sans-serif",
  "--font-body": "var(--font-ds-body), system-ui, sans-serif",
  "--font-meta": "var(--font-ds-meta), ui-monospace, monospace",
} as CSSProperties;

export const metadata: Metadata = {
  title: "Forside (AK Golf Design System) — forhåndsvisning",
  robots: { index: false, follow: false },
};

export default function ForsideNyPage() {
  return (
    <div className={`ak-ds ${FONT_KLASSER}`} style={FONT_VARS}>
      <ForsideDS />
    </div>
  );
}
