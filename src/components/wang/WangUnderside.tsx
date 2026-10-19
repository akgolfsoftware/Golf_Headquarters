import React from "react";
import type { UserRole } from "@/generated/prisma/client";

import { WangAppSkall, type WangOmraade } from "@/components/wang/WangAppSkall";
import { wangRolleFor } from "@/app/team-wang/_data/wang-rolle";

/**
 * Ramme for undersidene i trenerflaten som har egen adresse
 * (/team-wang/coach/tester, /coach/iup/[elevId], /coach/turneringer/[elevId]).
 * Trener og sportssjef får samme skall som /team-wang/coach, med riktig menypunkt aktivt.
 * Elev og forelder (som IUP- og turneringssiden fortsatt slipper inn) får samme stil uten
 * trenermenyen, fordi menyen bare gjelder trener og sportssjef (beslutning 27.09).
 * `wg-arv` oversetter de gamle WANG-variablene (avrundede kort, skygger, sans-brødtekst)
 * til wang.no-stilen for komponenter som ikke er skrevet om ennå.
 */
export function WangUnderside({
  bruker,
  omraade,
  children,
}: {
  bruker: { role: UserRole; name?: string | null };
  omraade: WangOmraade;
  children: React.ReactNode;
}) {
  const erTrener = bruker.role === "ADMIN" || bruker.role === "COACH";
  if (erTrener) {
    return (
      <WangAppSkall rolle={wangRolleFor(bruker)} brukerNavn={bruker.name ?? undefined} aktivtOmraade={omraade}>
        <div className="wg-arv">{children}</div>
      </WangAppSkall>
    );
  }
  return (
    <div className="wg-shell wg-shell-uten-meny">
      <div className="wg-main">
        <main className="wg-body wg-arv">{children}</main>
      </div>
    </div>
  );
}
