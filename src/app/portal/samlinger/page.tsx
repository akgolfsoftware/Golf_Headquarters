/**
 * Invitasjoner til samlinger i PlayerHQSkall.
 * Ruten har ingen tegnet skjermtype. Listen og svarene er beholdt.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { hentMineSamlingsinvitasjoner } from "@/lib/workbench/samlingsinvitasjon-actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { SamlingsinvitasjonListe } from "./samlingsinvitasjon-liste";

export const dynamic = "force-dynamic";
export const metadata = { title: "Samlinger · PlayerHQ" };

export default async function SamlingsinvitasjonerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  if (user.role !== "PLAYER") redirect("/portal");
  const [invitasjoner, ulest] = await Promise.all([
    hentMineSamlingsinvitasjoner(),
    getUnreadNotifications(user.id, 1),
  ]);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side ph-samling">
        <header>
          <p>PlayerHQ · Workbench</p>
          <h1>Invitasjoner til samlinger</h1>
          <p>Se hele programmet og sjekk kalenderkollisjoner før du svarer.</p>
        </header>
        <Link href="/portal/planlegge/workbench" className="pa-btn pa-btn--secondary">Åpne Workbench</Link>
        <SamlingsinvitasjonListe invitasjoner={invitasjoner} />
      </div>
    </PlayerHQSkall>
  );
}
