/**
 * /portal/tren/tester/[testId]/gjennomfor — gjennomfør test med scorekort (v2).
 * v2-port 17. juli 2026 (Team D2): flyttet fra (fullscreen-test) inn i
 * (fullscreen)-gruppen (samme chrome-løse fullskjerm-konvensjon som
 * live-familien), header restylet til v2 T-tokens. Server-logikken er uendret:
 * auth + tilgangsregel (testTilgangWhere — andres private tester gir 404),
 * protocol-JSON tolkes via parseProtocol (zod safeParse) og normaliseres til
 * ScorekortSpec; eldre tester uten protocol får fallback (ett tallfelt
 * «Score»). Selve flyten (Brief → Scorekort → Oppsummering) er klient-side.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { testTilgangWhere } from "@/lib/portal-tester/test-tilgang";
import { fallbackScorekortSpec, parseProtocol } from "@/lib/portal-tester/protocol";
import { T } from "@/lib/v2/tokens";
import { ScorekortKlient } from "./scorekort-klient";

export const dynamic = "force-dynamic";

/** Splitter testnavnet så siste ord kan rendres i kursiv lime-aksent (v2-idiom). */
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
    <div style={{ minHeight: "100dvh", background: T.bg, color: T.fg, fontFamily: T.ui }}>
      <div
        className="mx-auto w-full max-w-[460px] px-4 pb-8 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6"
        style={{ paddingTop: "calc(16px + env(safe-area-inset-top))" }}
      >
        {/* v2-header — mono eyebrow + display-tittel m/ kursiv lime-aksent */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.mut }}>
            Test · {test.pyramidArea}
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mut, fontVariantNumeric: "tabular-nums" }}>
            {spec.forsok.length} forsøk
          </span>
        </div>
        <h1 style={{ margin: "8px 0 0", fontFamily: T.disp, fontWeight: 700, fontSize: 28, lineHeight: 1.06, letterSpacing: "-0.025em", color: T.fg }}>
          {foran ? (
            <>
              {foran} <em style={{ fontStyle: "italic", color: T.lime }}>{accent}</em>
            </>
          ) : (
            accent
          )}
        </h1>
        <div style={{ maxWidth: 680 }}>
          <ScorekortKlient
            testId={test.id}
            beskrivelse={test.description}
            scoringRule={test.scoringRule}
            spec={spec}
            protocol={test.protocol}
          />
        </div>
      </div>
    </div>
  );
}
