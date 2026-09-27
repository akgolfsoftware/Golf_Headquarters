import type { ReactNode } from "react";
import { Jost, Lato } from "next/font/google";

/**
 * Team Norway — egen flate, egen designfasit.
 *
 * Jost (display) og Lato (brødtekst) lastes KUN her, scoped til
 * `/team-norway/*`, ikke i root-layout. CLAUDE.md invariant 2
 * («Poppins/Lora/IBM Plex Mono er de ENESTE fontene») gjelder PlayerHQ og
 * AgencyOS — Team Norway er et eget, sideordnet system med egen fasit
 * (Anders 22.09.2026, se .claude/rules/beslutninger.md §TEAM NORWAY-APPEN
 * BYTTER DESIGNSPRÅK). Jost er Futura-slekt og ligger nærmest ordmerkets
 * tynne, sperrede versaler; vekt 300 er displayvekten.
 *
 * Schibsted Grotesk er ute av systemet. IBM Plex Mono gjenbrukes fra
 * root-layout — se src/styles/team-norway-tokens.css for begrunnelsen.
 */
const jost = Jost({
  variable: "--font-jost",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function TeamNorwayLayout({ children }: { children: ReactNode }) {
  return <div className={`${jost.variable} ${lato.variable}`}>{children}</div>;
}
