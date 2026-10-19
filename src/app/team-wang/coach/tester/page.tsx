import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentWangTestresultatSkolerForTrener } from "@/lib/portal-tester/wang-resultat-tilgang";
import { formaterLagretTestResultat } from "@/lib/portal-tester/resultat-visning";
import { prisma } from "@/lib/prisma";

import { WangUnderside } from "@/components/wang/WangUnderside";
import { WangSmaaTall, WangTilbake, WangTopp, wangHref } from "@/components/wang/wang-felles";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Testresultater — WANG",
  robots: { index: false, follow: false },
};

const PER_SIDE = 50;

function formaterDato(dato: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Oslo",
  }).format(dato);
}

export default async function WangTestresultaterPage({
  searchParams,
}: {
  searchParams: Promise<{ side?: string }>;
}) {
  const bruker = await requirePortalUser({
    tillatDemo: true,
    allow: ["ADMIN", "COACH"],
    redirectTo: "/team-wang/logg-inn?next=%2Fteam-wang%2Fcoach%2Ftester",
  });
  const skoler = await hentWangTestresultatSkolerForTrener(bruker);
  if (skoler.length === 0) notFound();

  const { side: sideParam } = await searchParams;
  const ønsketSide = Math.max(1, Number.parseInt(sideParam ?? "1", 10) || 1);
  const spillerIder = [...new Set(skoler.flatMap((skole) => skole.playerIds))];
  const where = { userId: { in: spillerIder } };
  const antall = await prisma.testResult.count({ where });
  const sisteSide = Math.max(1, Math.ceil(antall / PER_SIDE));
  const side = Math.min(ønsketSide, sisteSide);
  const resultater = await prisma.testResult.findMany({
    where,
    orderBy: [{ takenAt: "desc" }, { id: "desc" }],
    skip: (side - 1) * PER_SIDE,
    take: PER_SIDE,
    select: {
      id: true,
      userId: true,
      testId: true,
      takenAt: true,
      score: true,
      details: true,
      user: { select: { name: true } },
      test: { select: { name: true, protocol: true } },
    },
  });

  const skolerForSpiller = new Map<string, string[]>();
  for (const skole of skoler) {
    for (const spillerId of skole.playerIds) {
      const navn = skolerForSpiller.get(spillerId) ?? [];
      navn.push(skole.schoolName);
      skolerForSpiller.set(spillerId, navn);
    }
  }
  return (
    <WangUnderside bruker={bruker} omraade="tester">
      <WangTilbake href={wangHref("tester")} tekst="Tester" />
      <WangTopp
        dato="Måling · utvikling"
        tittel="Testresultater"
        ingress="Resultater for spillere i skolene du trener ved som har samtykket til å dele testene. Trekker en spiller samtykket, forsvinner resultatene med en gang."
      >
        <WangSmaaTall tall={[{ verdi: String(antall), tekst: antall === 1 ? "resultat" : "resultater" }]} />
      </WangTopp>

      <section className="wg-seksjon" aria-label="WANG-skoler med innsyn">
        <div className="wg-sek-topp">
          <h2>Skoler</h2>
        </div>
        <div className="wg-kort wg-rader">
          {skoler.map((skole) => (
            <div className="wg-rad" key={skole.groupId}>
              <b>{skole.schoolName}</b>
              <span className="wg-kilde">{skole.players.length} deler testene</span>
            </div>
          ))}
        </div>
      </section>

      <section className="wg-seksjon" aria-label="Resultater">
        <div className="wg-sek-topp">
          <h2>Siste resultater</h2>
          {sisteSide > 1 ? <span className="wg-kilde">Side {side} av {sisteSide}</span> : null}
        </div>
        {resultater.length ? (
          <div className="wg-kort wg-rader">
            {resultater.map((resultat) => (
              <div className="wg-rad wg-resultat-rad" key={resultat.id}>
                <span style={{ display: "grid", gap: 2 }}>
                  <b>{resultat.user.name ?? "Ukjent spiller"}</b>
                  <span>{resultat.test.name}</span>
                </span>
                <span className="wg-tall">
                  {formaterLagretTestResultat({
                    testId: resultat.testId,
                    score: resultat.score,
                    details: resultat.details,
                    protocol: resultat.test.protocol,
                  })}
                </span>
                <span className="wg-kilde">
                  {[(skolerForSpiller.get(resultat.userId) ?? []).join(", "), formaterDato(resultat.takenAt)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="wg-kort" style={{ padding: "18px 20px", display: "grid", gap: 6 }}>
            <b className="wg-undertittel">Ingen registrerte testresultater ennå</b>
            <p className="wg-forklar">Resultater vises her når spillere i gruppen har fullført en test.</p>
          </div>
        )}

        {sisteSide > 1 && (
          <nav className="wg-sider" aria-label="Resultatsider">
            {side > 1 ? (
              <Link className="wg-btn wg-btn-secondary" href={`/team-wang/coach/tester?side=${side - 1}`}>Forrige</Link>
            ) : <span />}
            <span className="wg-kilde">Side {side} av {sisteSide}</span>
            {side < sisteSide ? (
              <Link className="wg-btn wg-btn-secondary" href={`/team-wang/coach/tester?side=${side + 1}`}>Neste</Link>
            ) : <span />}
          </nav>
        )}
      </section>
    </WangUnderside>
  );
}
