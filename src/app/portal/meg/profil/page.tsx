// PH24Profil — Precision Athletics. Data og handlinger er beholdt.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * PlayerHQ · Meg · Profil (PH-24).
 * Kilde: AK Golf Precision Athletics PH-24 (Meg / Profil, ui_kits/playerhq/screens/PH-24.jsx).
 *
 * Profil, personalia, kontaktinformasjon og forbundsstatus.
 * Dataloader gjenbruker hentProfil (User-feltene); hentProfilEkstra legger
 * til stall-tag, runder i år, Golfbox-ID og aktivt HCP-mål.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentProfil } from "@/app/portal/meg/actions";
import { hentProfilEkstra } from "@/lib/portal/profil-flate-data";
import { PH24Profil, type PH24ProfilData } from "@/components/portal/precision/PH24Profil";
import { lagreProfil } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil · PlayerHQ" };

function formatHcpMaal(maal: {
  verdi: number | null;
  tittel: string;
  innen: string | null;
}): string {
  const tall = maal.verdi != null ? maal.verdi.toFixed(1).replace(".", ",") : null;
  if (tall && maal.innen) return `${tall} innen ${maal.innen}`;
  if (tall) return tall;
  return maal.tittel;
}

export default async function ProfilPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [profil, ekstra] = await Promise.all([hentProfil(), hentProfilEkstra(user.id)]);

  const data: PH24ProfilData = {
    navn: profil.user.name,
    avatarUrl: profil.user.avatarUrl,
    epost: profil.user.email,
    mobil: profil.user.phone,
    hcp: profil.user.hcp,
    homeClub: profil.user.homeClub,
    fodselsdatoISO: profil.user.dateOfBirth
      ? profil.user.dateOfBirth.toISOString().slice(0, 10)
      : null,
    ambition: user.ambition,
    spillerSiden: ekstra.spillerSiden,
    stallNavn: ekstra.stallNavn,
    runderIAar: ekstra.runderIAar,
    ngfId: ekstra.ngfId,
    hcpMaalTekst: ekstra.hcpMaal ? formatHcpMaal(ekstra.hcpMaal) : null,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH24Profil data={data} onLagre={lagreProfil} />
    </PlayerHQSkall>
  );
}
