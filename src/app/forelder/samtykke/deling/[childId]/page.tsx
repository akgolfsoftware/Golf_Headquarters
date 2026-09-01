/**
 * TN-12 Samtykke og deling (foreldrevisning) — designfasit
 * designsystem/team-norway/templates/tn-samtykke/ er tegnet nettopp i denne
 * visningen («Marit Hovden · foresatt for Emma (16)»). Se TnSamtykkeSide.tsx.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { grupperMedEksterneLesereForSpiller, hentDelingsStatus } from "@/lib/deling/samtykke";
import { V2Shell, FORELDER_NAV, FORELDER_MER } from "@/components/v2/shell";
import { InnstillingerHode } from "@/components/portal/v2/InnstillingerHode";
import { TnSamtykkeSide, type TnOrganisasjon } from "@/components/portal/v2/TnSamtykkeSide";
import { settDelingsSamtykkeForBarn } from "@/app/forelder/samtykke/actions";

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
  const status = await hentDelingsStatus(childId, grupper.map((g) => g.id));
  const kart = new Map(status.map((s) => [s.gruppeId, s]));

  const organisasjoner: TnOrganisasjon[] = grupper.map((g) => ({
    gruppeId: g.id,
    navn: g.name,
    testerOgResultater: (kart.get(g.id)?.testResultater ?? false) && (kart.get(g.id)?.stats ?? false),
    komplettProfil: kart.get(g.id)?.komplettProfil ?? false,
  }));

  async function settSamtykke(scope: string, gruppeId: string, gitt: boolean) {
    "use server";
    return settDelingsSamtykkeForBarn(childId, scope, gruppeId, gitt);
  }

  return (
    <V2Shell bredde="kolonne" aktiv="oversikt" nav={FORELDER_NAV} mer={FORELDER_MER} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <InnstillingerHode tittel={`Hvem ser ${barn.name.split(" ")[0]}s data`} undertekst="Samtykke og deling" tilbakeHref="/forelder/samtykke" />
        <TnSamtykkeSide organisasjoner={organisasjoner} settSamtykke={settSamtykke} krevesForesatt={barn.requiresGuardianConsent} />
      </div>
    </V2Shell>
  );
}
