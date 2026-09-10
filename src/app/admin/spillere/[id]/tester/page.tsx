/**
 * AgencyOS — coach-view av en spillers tester (/admin/spillere/[id]/tester),
 * v2-design (retning C).
 *
 * Auth + dataloader gjenbrukt 1:1 fra den forrige (legacy) siden:
 * requirePortalUser (ADMIN/COACH) + loadSpillerTesterData. Spiller-id kommer
 * fra ruten (params.id) — notFound() hvis ingen data finnes.
 *
 * Server component.
 */

import { prisma } from "@/lib/prisma";
import { tnComparableResult } from "@/lib/portal-tester/tn-integration";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnFormat } from "@/lib/portal-tester/tn-scoring";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadSpillerTesterData } from "@/lib/admin/spiller-tester-data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminSpillerTesterV2 } from "@/components/admin/v2/AdminSpillerTesterV2";

export const dynamic = "force-dynamic";

export default async function SpillerTesterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const data = await loadSpillerTesterData(id, user);
  if (!data) notFound();
  const results = await prisma.testResult.findMany({ where: { userId: id, testId: { startsWith: "tn-v3-" } }, select: { id: true, testId: true, score: true, details: true, takenAt: true }, orderBy: { takenAt: "desc" }, take: 100 });

  return (
    <V2Shell bredde="kolonne" aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminSpillerTesterV2 data={data} playerId={id} />
      <section aria-label="Team Norway-resultater"><h2>Team Norway-resultater</h2>
        {results.length === 0 ? <p>Ingen resultater fra den nye testutgaven.</p> : <ul>{results.map(row => {
          const result = tnComparableResult(row.testId, row.score, row.details);
          if (!result) return null;
          return <li key={row.id}>{tnProtocol(result.protocolId)?.name} · {result.count} forsøk · {tnFormat({ value: result.score, unit: result.unit })} · {row.takenAt.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}</li>;
        })}</ul>}
      </section>
    </V2Shell>
  );
}
