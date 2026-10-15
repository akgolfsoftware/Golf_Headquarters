/**
 * PlayerHQ · Meg · Profil (/portal/meg/profil) — PH-24 i nytt design
 * (docs/design-system/utkast-playerhq/meg.html, skjermen «Profil»).
 *
 * Dataloader gjenbruker hentProfil (User-feltene); hentProfilEkstra legger til
 * stall, runder i år, Golf-ID og aktivt HCP-mål. Turneringsresultatene kommer fra
 * koblingen til den offentlige turneringsbasen (bare brutto, uten Data Golf).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentProfil } from "@/app/portal/meg/actions";
import { hentProfilEkstra } from "@/lib/portal/profil-flate-data";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Profil, type PH24ProfilData } from "@/components/portal/precision/PH24Profil";
import { formaterTall } from "@/lib/format-tall";
import { lagreProfil } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil · PlayerHQ" };

const KORT_DATO = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Oslo" });

function formatHcpMaal(maal: { verdi: number | null; tittel: string; innen: string | null }): string {
  const tall = maal.verdi != null ? formaterTall(maal.verdi, 1, true) : null;
  if (tall && maal.innen) return `${tall} innen ${maal.innen}`;
  if (tall) return tall;
  return maal.tittel;
}

export default async function ProfilPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [profil, ekstra, historikk] = await Promise.all([
    hentProfil(),
    hentProfilEkstra(user.id),
    hentTurneringshistorikk(user.id).catch(() => null),
  ]);

  const rader = historikk ? historikk.aar.flatMap((a) => a.turneringer).slice(0, 3) : [];
  const data: PH24ProfilData = {
    navn: profil.user.name,
    avatarUrl: profil.user.avatarUrl,
    epost: profil.user.email,
    mobil: profil.user.phone,
    hcp: profil.user.hcp,
    homeClub: profil.user.homeClub,
    fodselsdatoISO: profil.user.dateOfBirth ? profil.user.dateOfBirth.toISOString().slice(0, 10) : null,
    ambition: user.ambition,
    spillerSiden: ekstra.spillerSiden,
    stallNavn: ekstra.stallNavn,
    runderIAar: ekstra.runderIAar,
    ngfId: ekstra.ngfId,
    hcpMaalTekst: ekstra.hcpMaal ? formatHcpMaal(ekstra.hcpMaal) : null,
    turneringer: historikk
      ? {
          // byggTurneringshistorikk skiller «ikke koblet» fra «koblet uten turneringer» bare i tomGrunn.
          koblet: historikk.harHistorikk || !historikk.tomGrunn.includes("ikke koblet"),
          tomGrunn: historikk.tomGrunn,
          rader: rader.map((r, i) => ({
            id: `${r.turneringId}-${i}`,
            navn: r.navn,
            dato: KORT_DATO.format(r.startDato),
            runder: r.runder?.length ? r.runder.map((x) => (x.brutto != null ? String(x.brutto) : "—")).join(", ") : null,
            brutto: r.brutto ?? null,
            plassering: r.plasseringTekst ?? null,
          })),
        }
      : null,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH24Profil data={data} onLagre={lagreProfil} />
    </PlayerHQSkall>
  );
}
