/**
 * PlayerHQ · Meg · Profil (W3-port av eksisterende flate).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-profil.html (§8 skjema).
 *
 * Konsolidering (manifest-w3-komplett.md): profil/konto/kontakt → én flate.
 * /portal/meg/konto og /portal/meg/kontakt finnes ikke som ruter i dag, så
 * kontakt-seksjonen (e-post/mobil) bor her — ingen URL-er fjernes.
 *
 * Dataloader gjenbruker hentProfil (User-feltene); hentProfilEkstra legger
 * til stall-tag, runder i år, Golfbox-ID og aktivt HCP-mål.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentProfil } from "@/app/portal/meg/actions";
import { hentProfilEkstra, manglendeProfilFelter } from "@/lib/portal/profil-flate-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegProfilV2, type MegProfilData } from "@/components/portal/v2/MegProfilV2";
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
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [profil, ekstra] = await Promise.all([hentProfil(), hentProfilEkstra(user.id)]);

  const data: MegProfilData = {
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
    mangler: manglendeProfilFelter({
      dateOfBirth: profil.user.dateOfBirth,
      homeClub: profil.user.homeClub,
      ambition: user.ambition,
    }),
  };

  return (
    <V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} navn={data.navn} avatarUrl={data.avatarUrl}>
      <MegProfilV2 data={data} lagre={lagreProfil} />
    </V2Shell>
  );
}
