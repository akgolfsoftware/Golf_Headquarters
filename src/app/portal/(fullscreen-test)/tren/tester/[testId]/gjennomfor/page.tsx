/**
 * /portal/tren/tester/[testId]/gjennomfor — gjennomfør test med scorekort.
 *
 * Server-side: auth + henter TestDefinition, tolker protocol-JSON via
 * parseProtocol (zod safeParse — begge protokoll-varianter) og normaliserer
 * til ScorekortSpec. Eldre tester uten protocol får fallback (ett tallfelt
 * «Score»). Selve flyten (Brief → Scorekort → Oppsummering) er klient-side.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { testTilgangWhere } from "@/lib/portal-tester/test-tilgang";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { fallbackScorekortSpec, parseProtocol } from "@/lib/portal-tester/protocol";
import { ScorekortKlient } from "./scorekort-klient";

export const dynamic = "force-dynamic";

export default async function GjennomforTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const user = await requirePortalUser();
  const { testId } = await params;

  // Tilgang: samme regel som katalogen — andres private tester gir 404 (K6).
  const test = await prisma.testDefinition.findFirst({
    where: { id: testId, AND: [testTilgangWhere(user.id)] },
    select: {
      id: true,
      name: true,
      description: true,
      pyramidArea: true,
      scoringRule: true,
      protocol: true,
    },
  });
  if (!test) notFound();

  const spec = parseProtocol(test.protocol) ?? fallbackScorekortSpec();

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      <AthleticEyebrow>Test · {test.pyramidArea}</AthleticEyebrow>
      <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.04] tracking-[-0.025em] text-foreground md:text-[30px]">
        {test.name}
      </h1>
      <div className="max-w-[680px]">
        <ScorekortKlient
          testId={test.id}
          beskrivelse={test.description}
          scoringRule={test.scoringRule}
          spec={spec}
          protocol={test.protocol}
        />
      </div>
    </div>
  );
}
