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
import { fallbackScorekortSpec, parseProtocol } from "@/lib/portal-tester/protocol";
import { ScorekortKlient } from "./scorekort-klient";

export const dynamic = "force-dynamic";

/** Splitter testnavnet så siste ord kan rendres i editorial forest-kursiv (hybrid). */
function delTittel(navn: string): { foran: string; accent: string } {
  const ord = navn.trim().split(/\s+/);
  if (ord.length < 2) return { foran: "", accent: navn };
  return { foran: ord.slice(0, -1).join(" "), accent: ord[ord.length - 1] };
}

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
  const { foran, accent } = delTittel(test.name);

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 pb-8 pt-4 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      {/* Editorial light header — mono eyebrow + display-tittel m/ forest-kursiv aksent (hybrid) */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Test · {test.pyramidArea}
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {spec.forsok.length} forsøk
        </span>
      </div>
      <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.04] tracking-[-0.025em] text-foreground md:text-[30px]">
        {foran ? (
          <>
            {foran}{" "}
            <span className="italic text-primary">{accent}</span>
          </>
        ) : (
          accent
        )}
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
