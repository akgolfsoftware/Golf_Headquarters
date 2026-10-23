import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import { getUnreadNotifications } from "@/app/portal/actions";
import { hentMineSamlingsinvitasjoner } from "@/lib/workbench/samlingsinvitasjon-actions";
import { SamlingsinvitasjonListe } from "./samlingsinvitasjon-liste";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Samlinger · PlayerHQ" };

export default async function SamlingsinvitasjonerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  if (user.role !== "PLAYER") redirect("/portal");
  const [invitasjoner, uleste] = await Promise.all([
    hentMineSamlingsinvitasjoner(),
    getUnreadNotifications(user.id, 1),
  ]);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <div className="phn phn-skra">
        <SkraTopp
          lav
          etikett="Samlinger"
          bilde="/images/playerhq/slag-putting.jpg" bildePosisjon="50% 50%"
          overlinje="Plan · Workbench"
          tittel="Invitasjoner til samlinger"
          ingress="Se hele programmet og sjekk kalenderkollisjoner før du svarer."
          handling={<Link className="phn-knapp pri skra-topp-knapp" href="/portal/planlegge/workbench">Åpne Workbench</Link>}
        />
        <SkraFlyt lav>
          <SamlingsinvitasjonListe invitasjoner={invitasjoner} />
        </SkraFlyt>
      </div>
    </PlayerHQSkall>
  );
}
