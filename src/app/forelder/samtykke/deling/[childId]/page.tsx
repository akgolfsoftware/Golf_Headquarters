// FO05Deling — Precision Athletics (FO05Deling). Data og handlinger er beholdt.
/**
 * FO-05 Deling (foreldrevisning). Fasit: docs/design-system/utkast-flater/forelder.html,
 * mal «deling». Visningen er FO05Deling; samtykkereglene er de samme som i TnSamtykkeSide.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { grupperMedEksterneLesereForSpiller, hentDelingsStatus } from "@/lib/deling/samtykke";
import { ForelderSkall } from "@/components/precision/ForelderSkall";
import { ChevronLeft } from "lucide-react";
import { FO05Deling, type FO05Organisasjon } from "@/components/forelder/FO05Deling";
import "@/styles/flater-ny-forelder-booking.css";
import { settDelingsSamtykkeForBarn } from "@/app/forelder/samtykke/actions";
import { hentWangTestdeling } from "@/lib/portal-tester/wang-resultat-tilgang";
import { WangTestforesporsel } from "@/components/portal/precision/WangTestforesporsel";

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
  const wangTestdeling = await hentWangTestdeling(childId);
  const wangPlandeling = await hentWangTestdeling(childId, "TRENINGSPLAN");
  const status = await hentDelingsStatus(childId, grupper.map((g) => g.id));
  const kart = new Map(status.map((s) => [s.gruppeId, s]));

  const organisasjoner: FO05Organisasjon[] = grupper.map((g) => ({
    gruppeId: g.id,
    navn: g.name,
    testerOgResultater: (kart.get(g.id)?.testResultater ?? false) && (kart.get(g.id)?.stats ?? false),
    komplettProfil: kart.get(g.id)?.komplettProfil ?? false,
  }));

  async function settSamtykke(scope: string, gruppeId: string, gitt: boolean) {
    "use server";
    return settDelingsSamtykkeForBarn(childId, scope, gruppeId, gitt);
  }

  const fornavn = barn.name.split(" ")[0] ?? barn.name;

  return (
    <ForelderSkall>
      <div className="pa-side">
        <div className="fob">
          <Link href="/forelder/samtykke" className="fob-tilbake"><ChevronLeft aria-hidden />Samtykke</Link>
          <header className="fob-hode">
            <p className="fob-kicker">Samtykke og deling</p>
            <h1>Hvem ser {fornavn}s data</h1>
            {barn.requiresGuardianConsent ? (
              <p>{fornavn} er under 16 år. Deling starter først når du har godkjent den.</p>
            ) : null}
          </header>
          <div className="fob-kort">
            <div className="fob-org">
              <strong>Navngitte trenere</strong>
            </div>
            <p className="fob-note">Trenere {fornavn} har sendt delingslenke til. En trener ser plan, økter, runder, tester, målsetninger, helse og meldinger, og kan bare foreslå endringer.</p>
            <Link href={`/portal/meg/deling?barn=${encodeURIComponent(childId)}`} className="fob-lenke">Navngitt trenerdeling for {fornavn}</Link>
          </div>
          <FO05Deling organisasjoner={organisasjoner} settSamtykke={settSamtykke} barnFornavn={fornavn} />
          {wangTestdeling.map((d) => <WangTestforesporsel key={d.gruppeId} {...d} modus={{ type: "foresatt", childId, barnNavn: barn.name }} />)}
          {wangPlandeling.map((d) => (
            <WangTestforesporsel key={`plan-${d.gruppeId}`} {...d} modus={{ type: "foresatt", childId, barnNavn: barn.name }} omfang="TRENINGSPLAN" />
          ))}
        </div>
      </div>
    </ForelderSkall>
  );
}
