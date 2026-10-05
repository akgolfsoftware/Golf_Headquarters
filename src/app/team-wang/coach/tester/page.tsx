import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentWangTestresultatSkolerForTrener } from "@/lib/portal-tester/wang-resultat-tilgang";
import { formaterLagretTestResultat } from "@/lib/portal-tester/resultat-visning";
import { prisma } from "@/lib/prisma";

import styles from "./tester.module.css";

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
    <main className={styles.side}>
      <header className={styles.topp}>
        <Link className={styles.tilbake} href="/team-wang/coach">
          <span aria-hidden="true">←</span> Trenerflate
        </Link>
        <span className={styles.merke}>WANG GOLF</span>
      </header>

      <section className={styles.innhold}>
        <p className={styles.overlinje}>MÅLING · UTVIKLING</p>
        <div className={styles.tittelRad}>
          <div>
            <h1>Testresultater</h1>
            <p className={styles.intro}>
              Resultater for spillere i skolene du trener ved. Bare aktive
              WANG-gruppetilknytninger gir innsyn.
            </p>
          </div>
          <div className={styles.antall}>
            <strong>{antall}</strong>
            <span>{antall === 1 ? "resultat" : "resultater"}</span>
          </div>
        </div>

        <div className={styles.skoleliste} aria-label="WANG-skoler med innsyn">
          {skoler.map((skole) => (
            <span className={styles.skole} key={skole.groupId}>
              {skole.schoolName}
              <span>{skole.players.length} spillere</span>
            </span>
          ))}
        </div>

        {resultater.length ? (
          <div className={styles.tabellRamme}>
            <table className={styles.tabell}>
              <thead>
                <tr>
                  <th scope="col">Spiller</th>
                  <th scope="col">Test</th>
                  <th scope="col">Resultat</th>
                  <th scope="col">Skole</th>
                  <th scope="col">Dato</th>
                </tr>
              </thead>
              <tbody>
                {resultater.map((resultat) => (
                  <tr key={resultat.id}>
                    <td data-label="Spiller">{resultat.user.name ?? "Ukjent spiller"}</td>
                    <td data-label="Test">{resultat.test.name}</td>
                    <td className={styles.resultat} data-label="Resultat">
                      {formaterLagretTestResultat({
                        testId: resultat.testId,
                        score: resultat.score,
                        details: resultat.details,
                        protocol: resultat.test.protocol,
                      })}
                    </td>
                    <td data-label="Skole">
                      {(skolerForSpiller.get(resultat.userId) ?? []).join(", ")}
                    </td>
                    <td data-label="Dato">{formaterDato(resultat.takenAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.tom}>
            <span className={styles.tomIkon} aria-hidden="true">—</span>
            <h2>Ingen registrerte testresultater ennå</h2>
            <p>Resultater vises her når spillere i gruppen har fullført en test.</p>
          </div>
        )}

        {sisteSide > 1 && (
          <nav className={styles.paginering} aria-label="Resultatsider">
            {side > 1 ? (
              <Link href={`/team-wang/coach/tester?side=${side - 1}`}>Forrige</Link>
            ) : <span />}
            <span>Side {side} av {sisteSide}</span>
            {side < sisteSide ? (
              <Link href={`/team-wang/coach/tester?side=${side + 1}`}>Neste</Link>
            ) : <span />}
          </nav>
        )}
      </section>
    </main>
  );
}
