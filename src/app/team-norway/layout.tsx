import type { ReactNode } from "react";
import { Schibsted_Grotesk } from "next/font/google";

/**
 * Team Norway (Claw batch 3, 01.09.2026) — egen flate, egen designfasit.
 *
 * Schibsted Grotesk lastes KUN her, scoped til `/team-norway/*`, ikke i
 * root-layout. CLAUDE.md invariant 2 («Poppins/Lora/IBM Plex Mono er de
 * ENESTE fontene») gjelder PlayerHQ og AgencyOS — Team Norway er et eget,
 * sideordnet system med egen fasit (Anders 30.08.2026, se
 * .claude/rules/beslutninger.md §TEAM NORWAY-SKJERMENE DESIGNES I CLAUDE-
 * BRANDINGEN). IBM Plex Mono gjenbrukes fra root-layout — se
 * src/styles/team-norway-tokens.css for begrunnelsen.
 */
const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export default function TeamNorwayLayout({ children }: { children: ReactNode }) {
  return <div className={schibstedGrotesk.variable}>{children}</div>;
}
