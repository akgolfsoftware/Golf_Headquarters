// FO05Deling — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
/**
 * TN-12 Samtykke og deling (foreldrevisning) — designfasit
 * designsystem/team-norway/templates/tn-samtykke/ er tegnet nettopp i denne
 * visningen («Marit Hovden · foresatt for Emma (16)»). Se TnSamtykkeSide.tsx.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { grupperMedEksterneLesereForSpiller, hentDelingsStatus } from "@/lib/deling/samtykke";
import { ForelderSkall } from "@/components/precision/ForelderSkall";
import { InnstillingerHode } from "@/components/portal/v2/InnstillingerHode";
import { TnSamtykkeSide, type TnOrganisasjon } from "@/components/portal/v2/TnSamtykkeSide";
import { settDelingsSamtykkeForBarn } from "@/app/forelder/samtykke/actions";
import { harAutomatiskWangTestdeling } from "@/lib/portal-tester/wang-resultat-tilgang";

export const dynamic = "force-dynamic";

export default async function ForelderDelingPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const user = await requirePortalUser({ allow: ["PARENT"] });

  const relasjon = await prisma.parentRelation.findFirst({
    where: { parentId: user.id, childId, approved: true },
    select: { child: { select: { id: true, name: true, requiresGuardianConsent: true } } },
  });
  if (!relasjon) notFound();
  const barn = relasjon.child;

  const grupper = await grupperMedEksterneLesereForSpiller(childId);
  const automatiskWangTestdeling = await harAutomatiskWangTestdeling(childId);
  const status = await hentDelingsStatus(childId, grupper.map((g) => g.id));
  const kart = new Map(status.map((s) => [s.gruppeId, s]));

  const organisasjoner: TnOrganisasjon[] = grupper.map((g) => ({
    gruppeId: g.id,
    navn: g.name,
    testerOgResultater: (kart.get(g.id)?.testResultater ?? false) && (kart.get(g.id)?.stats ?? false),
    stats: kart.get(g.id)?.stats ?? false,
    testResultaterAutomatisk: automatiskWangTestdeling && g.slug === "team-norway",
    komplettProfil: kart.get(g.id)?.komplettProfil ?? false,
  }));

  async function settSamtykke(scope: string, gruppeId: string, gitt: boolean) {
    "use server";
    return settDelingsSamtykkeForBarn(childId, scope, gruppeId, gitt);
  }

  return (
        <ForelderSkall>
      <div className="pa-side">
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <InnstillingerHode tittel={`Hvem ser ${barn.name.split(" ")[0]}s data`} undertekst="Samtykke og deling" tilbakeHref="/forelder/samtykke" />
        <Link href={`/portal/meg/deling?barn=${encodeURIComponent(childId)}`} style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>Navngitt trenerdeling for {barn.name.split(" ")[0]}</Link>
        <TnSamtykkeSide organisasjoner={organisasjoner} settSamtykke={settSamtykke} krevesForesatt={barn.requiresGuardianConsent} automatiskWangTestdeling={automatiskWangTestdeling} modus="foresatt" />
      </div>
          </div>
    </ForelderSkall>
  );
}
