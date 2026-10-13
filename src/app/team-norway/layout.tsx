import type { ReactNode } from "react";
import { TnBrandFrame } from "@/components/precision/brand/TnBrandFrame";

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
export default function TeamNorwayLayout({ children }: { children: ReactNode }) {
  return <TnBrandFrame>{children}</TnBrandFrame>;
}
