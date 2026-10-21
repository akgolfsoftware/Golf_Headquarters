import type { ReactNode } from "react";
import { Schibsted_Grotesk } from "next/font/google";
import { redirect } from "next/navigation";

import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { hentTnGrupperolle } from "@/lib/domain/tn-tilgang";
import { tnIkkeTrenerMaal } from "@/lib/domain/tn-trenerport";

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

/**
 * Team Norway er bare for trenere (Anders 21.10.2026, beslutninger.md §TEAM NORWAY
 * ER BARE FOR TRENERE): spillere sendes til PlayerHQ, foreldre til forelderflaten.
 * Uinnloggede håndteres av proxyen. Spillerens egen visning i sidene og datalaget
 * (`erSpiller`) står til sidene portes; den viser bare spillerens egne data.
 */
export default async function TeamNorwayLayout({ children }: { children: ReactNode }) {
  const bruker = await getCurrentUserRaw();
  if (bruker) {
    const maal = tnIkkeTrenerMaal(bruker.role, bruker.role === "ADMIN" ? null : await hentTnGrupperolle(bruker.id));
    if (maal) redirect(maal);
  }
  return <div className={schibstedGrotesk.variable}>{children}</div>;
}
