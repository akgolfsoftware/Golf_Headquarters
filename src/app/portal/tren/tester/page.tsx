/**
 * PlayerHQ · Tren · Tester (/portal/tren/tester) — v10-design.
 *
 * Rendrer <TesterListe> (v10-fasit fra pl-tester) med EKTE data fra
 * loadTesterScreen (Prisma: TestDefinition, TestResult, TestSession).
 * mapTesterData oversetter TesterScreenData-shapen til TesterListeData.
 * Tom-tilstand bevares: ingen resultater → latest udefinert, tellere 0,
 * hver rad «Ikke tatt». Aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser (PLAYER/COACH/ADMIN).
 *
 * 3. juni: byttet fra TesterScreen (components-test-week.html) til TesterListe (v10).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadTesterScreen, type TesterScreenData } from "@/lib/portal-tester/tester-data";
import {
  TesterListe,
  type TesterListeData,
  type TestRow,
} from "@/components/portal/tester/tester-liste";

export const dynamic = "force-dynamic";

/** Oversetter ekte TesterScreenData → v10 TesterListeData. Tom-tilstand bevares. */
function mapTesterData(data: TesterScreenData): TesterListeData {
  const rows: TestRow[] = data.groups.flatMap((group) =>
    group.rows.map((r) => ({
      id: r.id,
      name: r.name,
      axis: r.axis,
      // latest udefinert = «Ikke tatt» (tom-tilstand). Aldri tving en verdi.
      latest: r.latest ?? undefined,
      href: r.href,
    })),
  );

  const pagaende = data.planned.filter((p) => p.state === "ongoing").length;

  return {
    eyebrow: "PlayerHQ · Trening · Tester",
    gjennomfort: data.testedCount,
    totalt: data.totalTests,
    totaleForsok: data.totalAttempts,
    pagaende,
    rows,
    hrefs: {
      nyTest: "/portal/tren/tester/ny",
      katalog: "/portal/tren/tester/katalog",
    },
  };
}

export default async function TesterPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const data = await loadTesterScreen({
    id: user.id,
    name: user.name,
    hcp: user.hcp,
    tier: user.tier,
  });

  return <TesterListe data={mapTesterData(data)} />;
}
