/**
 * v2-forhåndsvisning — AgencyOS Tester (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), AdminTesterV2 rendrer innholds-stacken.
 *
 * Auth + dataloader speiler den ekte /admin/tester-flaten 1:1:
 *   - prisma.testSession (IN_PROGRESS) → «Pågår»-rader
 *   - prisma.testResult (siste 20)     → resultat-rader m/ delta + status
 *   - count siste 30 d / 7 d           → KPI «Tester utført» / «Sist uke»
 *   - snitt score siste 30 d           → KPI «Snitt-score»
 *
 * All mapping til AdminTesterV2Data skjer her (serverside) så klientkomponenten
 * er ren presentasjon. Ingen fabrikerte tall — mangler i schemaet vises ærlig.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminTesterV2,
  type AdminTesterV2Data,
  type AdminTesterV2Rad,
  type AdminTesterStatus,
} from "@/components/admin/v2/AdminTesterV2";

export const dynamic = "force-dynamic";

function datoLabel(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
}

/** Brutto score-format: heltall som-er, ellers 1 desimal med komma. */
function fmtScore(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

export default async function V2AdminTesterPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const naa = new Date();
  const d30 = new Date(naa.getTime() - 30 * 86_400_000);
  const d7 = new Date(naa.getTime() - 7 * 86_400_000);

  const [paagaaende, resultater, antall30, antall7] = await Promise.all([
    prisma.testSession.findMany({
      where: { status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
      take: 6,
      select: {
        id: true,
        startedAt: true,
        user: { select: { id: true, name: true } },
        test: { select: { name: true } },
      },
    }),
    prisma.testResult.findMany({
      orderBy: { takenAt: "desc" },
      take: 20,
      select: {
        id: true,
        takenAt: true,
        score: true,
        user: { select: { id: true, name: true } },
        test: { select: { name: true } },
      },
    }),
    prisma.testResult.count({ where: { takenAt: { gte: d30 } } }),
    prisma.testResult.count({ where: { takenAt: { gte: d7 } } }),
  ]);

  // Snitt-score siste 30 d (samme heuristikk som fasit-flaten)
  const siste30 = resultater.filter((r) => r.takenAt >= d30);
  const snittScore =
    siste30.length > 0
      ? Math.round(siste30.reduce((acc, r) => acc + r.score, 0) / siste30.length)
      : null;

  // Delta: sammenlign score med forrige TestResult for samme spiller + test
  const perSpillerTest = new Map<string, number[]>();
  for (const r of resultater) {
    const k = `${r.user.id}::${r.test.name}`;
    if (!perSpillerTest.has(k)) perSpillerTest.set(k, []);
    perSpillerTest.get(k)!.push(r.score);
  }

  const rader: AdminTesterV2Rad[] = [
    ...paagaaende.map(
      (s): AdminTesterV2Rad => ({
        key: `s-${s.id}`,
        spillerId: s.user.id,
        navn: s.user.name,
        test: s.test.name,
        resultat: "—",
        delta: null,
        deltaDir: null,
        dato: datoLabel(s.startedAt),
        status: "Pågår",
      }),
    ),
    ...resultater.slice(0, 14).map((r): AdminTesterV2Rad => {
      const serie = perSpillerTest.get(`${r.user.id}::${r.test.name}`) ?? [];
      // Serie er sortert desc — indeks 0 = siste, indeks 1 = forrige
      const forrige = serie[1] ?? null;
      let delta: string | null = null;
      let deltaDir: "up" | "down" | null = null;
      let status: AdminTesterStatus = "Ferdig";
      if (forrige !== null) {
        const diff = r.score - forrige;
        if (Math.abs(diff) < 0.05) {
          status = "Stabilt";
        } else if (diff > 0) {
          delta = `+${fmtScore(diff)}`;
          deltaDir = "up";
          status = "Bedre";
        } else {
          delta = fmtScore(diff);
          deltaDir = "down";
          status = "Svakere";
        }
      }
      return {
        key: `r-${r.id}`,
        spillerId: r.user.id,
        navn: r.user.name,
        test: r.test.name,
        resultat: fmtScore(r.score),
        delta,
        deltaDir,
        dato: datoLabel(r.takenAt),
        status,
      };
    }),
  ];

  const tester = Array.from(new Set(rader.map((r) => r.test)));

  const data: AdminTesterV2Data = {
    kpis: [
      { label: "Tester utført", value: String(antall30) },
      { label: "Snitt-score", value: snittScore !== null ? String(snittScore) : "—", accent: true },
      { label: "Sist uke", value: String(antall7) },
      { label: "Pågår nå", value: String(paagaaende.length), varsle: paagaaende.length > 0 },
    ],
    tester,
    rader,
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminTesterV2 data={data} />
    </V2Shell>
  );
}
