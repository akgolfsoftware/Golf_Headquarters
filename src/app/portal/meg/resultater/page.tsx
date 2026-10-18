// PH-24 Turneringsresultater — Precision Athletics, pakke 14 (16.10.2026).
/**
 * PlayerHQ · Meg · Turneringsresultater: koble profilen til resultathistorikken (GolfBox) og se
 * sesongtallene. Personvern: bare den innloggede brukerens EGNE resultater, via databasefunksjonene
 * som slår opp den bekreftede koblingen selv (src/lib/profil-kobling/data.ts). Ingen Data Golf-tall.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentKoblingsstatus, hentProfilResultater } from "@/lib/profil-kobling/data";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Resultater } from "@/components/portal/precision/PH24Resultater";

export const dynamic = "force-dynamic";
export const metadata = { title: "Turneringsresultater · PlayerHQ" };

export default async function ResultaterPage() {
  // Resultatlesing er stats-lesing, som er åpen for gratisprofilen (TALENT).
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  if (user.role === "PARENT") redirect("/forelder");

  const [status, uleste] = await Promise.all([hentKoblingsstatus(user.id), getUnreadNotifications(user.id, 1)]);
  const resultater = status.status === "confirmed" ? await hentProfilResultater(user.id) : null;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH24Resultater data={resultater
        ? { koblet: true, resultater }
        : { koblet: false, ventende: status.status === "pending" && status.candidate ? { linkId: status.link_id, kandidat: status.candidate } : null }} />
    </PlayerHQSkall>
  );
}
