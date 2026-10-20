import type { ReactNode } from "react";
import { Schibsted_Grotesk } from "next/font/google";

/**
 * Team Norway — egen flate, egen designfasit.
 *
 * Schibsted Grotesk (overskrifter og tekst) lastes KUN her, scoped til
 * `/team-norway/*` og `/teamnorway`, ikke i root-layout. Team Norway er et
 * eget, sideordnet system med egen fasit. Skriften er fra Team Norway
 * Golf-merket (Anders 20.10.2026, .claude/rules/beslutninger.md §TEAM
 * NORWAY-APPEN BEHOLDER NAVY SIDEMENY OG BYTTER TIL SCHIBSTED GROTESK).
 *
 * IBM Plex Mono gjenbrukes fra root-layout — se
 * src/styles/team-norway-tokens.css for begrunnelsen.
 */
const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export default function TeamNorwayLayout({ children }: { children: ReactNode }) {
  return <div className={schibstedGrotesk.variable}>{children}</div>;
}
