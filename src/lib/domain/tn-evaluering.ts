import "server-only";

import { prisma } from "@/lib/prisma";
import { loadTesterScreen, type TestRow } from "@/lib/portal-tester/tester-data";
import { hentTnTekniskPlaner, type TnTekniskPlanRad } from "@/lib/domain/tn-teknisk-plan";

/**
 * TN-24 Evaluering (14.09.2026, rettet etter Codex-review samme dag).
 *
 * Det finnes INGEN Evaluation-modell eller -handling i skjemaet (bekreftet
 * ved søk i `prisma/schema.prisma` før bygging). En «lagre evaluering»-
 * knapp ville derfor kalt en ikke-eksisterende handling eller stille funnet
 * på et resultat — begge deler forbudt av oppdraget. Denne fila er derfor
 * en LESEVISNING av det som faktisk finnes, med en ekte «neste steg»-lenke
 * inn i den allerede byggede teknisk plan-sida — ikke en ny lagringsmodell.
 * (Denne begrunnelsen er bevisst holdt utenfor selve brukerflaten — se
 * page.tsx og plan-result.md.)
 *
 * Testgrunnlaget gjenbrukes fra `loadTesterScreen` (samme datalag som
 * `/portal/tren/tester`, Codex-forslag) i stedet for en egen rå
 * `TestResult`-spørring — det gir riktig TALENT-tilgangsfilter
 * (`testTilgangWhere`) og samme formatering/enhetshåndtering som PlayerHQ,
 * fremfor et umerket rå tall.
 */

export type TnEvalueringNesteTiltak = {
  planId: string;
  taskId: string;
  tittel: string;
  posisjon: string;
};

export type TnEvalueringGrunnlag = {
  planer: TnTekniskPlanRad[];
  aktivPlan: TnTekniskPlanRad | null;
  nesteTiltak: TnEvalueringNesteTiltak | null;
  tester: TestRow[];
};

export async function hentTnEvalueringGrunnlag(spillerId: string): Promise<TnEvalueringGrunnlag> {
  const spiller = await prisma.user.findUnique({ where: { id: spillerId }, select: { name: true, hcp: true, tier: true } });

  const [planer, testerScreen] = await Promise.all([
    hentTnTekniskPlaner(spillerId),
    spiller
      ? loadTesterScreen({ id: spillerId, name: spiller.name, hcp: spiller.hcp, tier: spiller.tier })
      : null,
  ]);

  const tester = (testerScreen?.groups.flatMap((g) => g.rows) ?? [])
    .filter((t) => t.latest !== null)
    .sort((a, b) => (b.latestDate ?? "").localeCompare(a.latestDate ?? ""))
    .slice(0, 10);

  const aktivPlan = planer.find((p) => p.status === "ACTIVE") ?? planer[0] ?? null;

  let nesteTiltak: TnEvalueringNesteTiltak | null = null;
  if (aktivPlan) {
    const apenOppgave = await prisma.positionTask.findFirst({
      where: { position: { planId: aktivPlan.id }, status: { in: ["PENDING", "ACTIVE"] } },
      orderBy: [{ position: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      select: { id: true, tittel: true, position: { select: { pNummer: true, navn: true } } },
    });
    if (apenOppgave) {
      nesteTiltak = {
        planId: aktivPlan.id,
        taskId: apenOppgave.id,
        tittel: apenOppgave.tittel,
        posisjon: `${apenOppgave.position.pNummer} · ${apenOppgave.position.navn}`,
      };
    }
  }

  return { planer, aktivPlan, nesteTiltak, tester };
}
