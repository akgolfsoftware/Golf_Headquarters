/**
 * /innsyn/[spillerId] — spillerdetalj for ekstern leser (plan T8).
 *
 * Viser KUN det som er samtykket, per scope:
 *  - TEST_RESULTATER: CANON-testresultater (dato, score, benchmarknivå).
 *  - STATS: snittscore + SG-hovedtall fra Round.
 * Ingenting annet — aldri treningsplaner, notater eller helsedata.
 *
 * IDOR: id-en i URL-en valideres mot ekstern-leser-scopet FØR noe hentes.
 * En spillerId utenfor scopet gir notFound() — samme svar som en id som
 * ikke finnes, så flaten lekker ikke hvem som er i systemet.
 */

import { notFound, redirect } from "next/navigation";
import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { effectiveCapabilities } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { harEksternLeserTilgang } from "@/lib/auth/ekstern-leser-scope";
import { parseBenchmarks, achievedLevel } from "@/lib/admin/test-benchmarks";
import { prisma } from "@/lib/prisma";
import { TL } from "@/lib/v2/train-lock";

import Link from "next/link";

export const dynamic = "force-dynamic";

const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Oslo",
});

function fmtTall(n: number, desimaler = 1): string {
  return n.toFixed(desimaler).replace(".", ",");
}

function snitt(verdier: (number | null)[]): number | null {
  const tall = verdier.filter((v): v is number => v != null);
  if (tall.length === 0) return null;
  return tall.reduce((sum, v) => sum + v, 0) / tall.length;
}

export default async function InnsynSpillerPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  const { spillerId } = await params;

  const user = await getCurrentUserRaw();
  if (!user) redirect("/auth/login");
  const caps = await effectiveCapabilities(user);

  // Per-scope-tilgang: capability (leserens mandat) OG samtykke (spillerens
  // valg) må begge holde. Ingen av delene alene åpner noe.
  const [kanSeTester, kanSeStats] = await Promise.all([
    caps.has(Capability.VIEW_SHARED_TEST_RESULTS)
      ? harEksternLeserTilgang(user.id, spillerId, "TEST_RESULTATER")
      : Promise.resolve(false),
    caps.has(Capability.VIEW_SHARED_STATS)
      ? harEksternLeserTilgang(user.id, spillerId, "STATS")
      : Promise.resolve(false),
  ]);
  if (!kanSeTester && !kanSeStats) notFound();

  const spiller = await prisma.user.findUnique({
    where: { id: spillerId },
    select: { name: true, dateOfBirth: true },
  });
  if (!spiller) notFound();

  const [testResultater, runder] = await Promise.all([
    kanSeTester
      ? prisma.testResult.findMany({
          where: { userId: spillerId, test: { erCanon: true } },
          select: {
            id: true,
            takenAt: true,
            score: true,
            test: { select: { name: true, protocol: true } },
          },
          orderBy: { takenAt: "desc" },
          take: 100,
        })
      : Promise.resolve([]),
    kanSeStats
      ? prisma.round.findMany({
          where: { userId: spillerId },
          select: {
            score: true,
            sgTotal: true,
            sgOtt: true,
            sgApp: true,
            sgArg: true,
            sgPutt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const snittScore = snitt(runder.map((r) => r.score));
  const sgRader: { label: string; verdi: number | null }[] = [
    { label: "SG totalt", verdi: snitt(runder.map((r) => r.sgTotal)) },
    { label: "SG utslag", verdi: snitt(runder.map((r) => r.sgOtt)) },
    { label: "SG innspill", verdi: snitt(runder.map((r) => r.sgApp)) },
    { label: "SG nærspill", verdi: snitt(runder.map((r) => r.sgArg)) },
    { label: "SG putting", verdi: snitt(runder.map((r) => r.sgPutt)) },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Link
          href="/innsyn"
          style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, textDecoration: "none" }}
        >
          Tilbake til oversikten
        </Link>
        <h1
          style={{
            fontFamily: TL.font.sans,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: "8px 0 0",
          }}
        >
          {spiller.name}
        </h1>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "4px 0 0" }}>
          {spiller.dateOfBirth
            ? `Årgang ${spiller.dateOfBirth.getFullYear()}`
            : "Årgang ukjent"}
        </p>
      </div>

      {kanSeStats && (
        <section
          style={{
            background: TL.elev,
            border: `1px solid ${TL.hair}`,
            borderRadius: 14,
            padding: "16px 18px",
          }}
        >
          <h2 style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 700, margin: 0 }}>
            Statistikk
          </h2>
          {runder.length === 0 ? (
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "10px 0 0" }}>
              Ingen registrerte runder ennå.
            </p>
          ) : (
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 14,
                margin: "12px 0 0",
              }}
            >
              <div>
                <dt style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute }}>Runder</dt>
                <dd style={{ fontFamily: TL.font.mono, fontSize: 18, fontWeight: 600, margin: "2px 0 0" }}>
                  {runder.length}
                </dd>
              </div>
              <div>
                <dt style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute }}>Snittscore</dt>
                <dd style={{ fontFamily: TL.font.mono, fontSize: 18, fontWeight: 600, margin: "2px 0 0" }}>
                  {snittScore != null ? fmtTall(snittScore) : "—"}
                </dd>
              </div>
              {sgRader.map((rad) => (
                <div key={rad.label}>
                  <dt style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute }}>{rad.label}</dt>
                  <dd style={{ fontFamily: TL.font.mono, fontSize: 18, fontWeight: 600, margin: "2px 0 0" }}>
                    {rad.verdi != null
                      ? `${rad.verdi >= 0 ? "+" : ""}${fmtTall(rad.verdi, 2)}`
                      : "—"}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      {kanSeTester && (
        <section
          style={{
            background: TL.elev,
            border: `1px solid ${TL.hair}`,
            borderRadius: 14,
            padding: "16px 18px",
          }}
        >
          <h2 style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 700, margin: 0 }}>
            Testresultater
          </h2>
          {testResultater.length === 0 ? (
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "10px 0 0" }}>
              Ingen registrerte testresultater ennå.
            </p>
          ) : (
            <div style={{ overflowX: "auto", margin: "12px 0 0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
                <thead>
                  <tr>
                    {["Test", "Dato", "Score", "Nivå"].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontFamily: TL.font.sans,
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: TL.mute,
                          textAlign: "left",
                          padding: "0 12px 8px 0",
                          borderBottom: `1px solid ${TL.hair}`,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {testResultater.map((resultat) => {
                    const benchmarks = parseBenchmarks(resultat.test.protocol);
                    const nivaa = benchmarks
                      ? achievedLevel(benchmarks, resultat.score)
                      : null;
                    return (
                      <tr key={resultat.id}>
                        <td style={{ fontFamily: TL.font.sans, fontSize: 13, padding: "8px 12px 8px 0", borderBottom: `1px solid ${TL.hair}` }}>
                          {resultat.test.name}
                        </td>
                        <td style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, padding: "8px 12px 8px 0", borderBottom: `1px solid ${TL.hair}`, whiteSpace: "nowrap" }}>
                          {OSLO_DATO.format(resultat.takenAt)}
                        </td>
                        <td style={{ fontFamily: TL.font.mono, fontSize: 13, padding: "8px 12px 8px 0", borderBottom: `1px solid ${TL.hair}` }}>
                          {fmtTall(resultat.score)}
                        </td>
                        <td style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, padding: "8px 0", borderBottom: `1px solid ${TL.hair}` }}>
                          {nivaa?.label ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
