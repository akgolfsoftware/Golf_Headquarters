// PH25DelingSamtykke — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * TN-12 Samtykke og deling (spillersiden) — fullside-visning, drill-down fra
 * /portal/meg/innstillinger/personvern. Designfasit:
 * designsystem/team-norway/templates/tn-samtykke/. Se TnSamtykkeSide.tsx for
 * hvorfor Train-lock (ikke TN-tokens) og kaskade-logikken mellom bryterne.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { maaHaForesattSamtykke } from "@/lib/health/samtykke-regler";
import { grupperMedEksterneLesereForSpiller, hentDelingsStatus } from "@/lib/deling/samtykke";
import { InnstillingerHode } from "@/components/portal/v2/InnstillingerHode";
import { TnSamtykkeSide, type TnOrganisasjon } from "@/components/portal/v2/TnSamtykkeSide";
import { hentWangTnTestdeling } from "@/lib/portal-tester/wang-resultat-tilgang";
import { WangTnTestforesporsel } from "@/components/portal/precision/WangTnTestforesporsel";
import { giDelingsSamtykke, trekkDelingsSamtykke } from "@/app/portal/meg/innstillinger/personvern/deling-samtykke-actions";

export const dynamic = "force-dynamic";

export default async function DelingPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const krevesForesatt = maaHaForesattSamtykke(user);

  const grupper = await grupperMedEksterneLesereForSpiller(user.id);
  const wangTnTestdeling = await hentWangTnTestdeling(user.id);
  const status = await hentDelingsStatus(user.id, grupper.map((g) => g.id));
  const kart = new Map(status.map((s) => [s.gruppeId, s]));

  const organisasjoner: TnOrganisasjon[] = grupper.map((g) => ({
    gruppeId: g.id,
    navn: g.name,
    testerOgResultater: (kart.get(g.id)?.testResultater ?? false) && (kart.get(g.id)?.stats ?? false),
    komplettProfil: kart.get(g.id)?.komplettProfil ?? false,
  }));

  async function settSamtykke(scope: string, gruppeId: string, gitt: boolean) {
    "use server";
    return gitt ? giDelingsSamtykke(scope, gruppeId) : trekkDelingsSamtykke(scope, gruppeId);
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <InnstillingerHode tittel="Hvem ser dataene mine" undertekst="Samtykke og deling" tilbakeHref="/portal/meg/innstillinger/personvern" />
        <Link href="/portal/meg/deling" style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>Navngitt trenerdeling</Link>
        <TnSamtykkeSide organisasjoner={organisasjoner} settSamtykke={settSamtykke} krevesForesatt={krevesForesatt} />
        {wangTnTestdeling && <WangTnTestforesporsel status={wangTnTestdeling.status} kreverForesatt={wangTnTestdeling.kreverForesatt} modus={{ type: "spiller" }} />}
      </div>
    </div>
    </PlayerHQSkall>
  );
}
