/**
 * /portal/tren/tester/[testId]/gjennomfor — gjennomfør test med scorekort (v2).
 * v2-port 17. juli 2026 (Team D2): flyttet fra (fullscreen-test) inn i
 * (fullscreen)-gruppen (samme chrome-løse fullskjerm-konvensjon som
 * live-familien), header restylet til v2 T-tokens. Server-logikken er uendret:
 * auth + tilgangsregel (testTilgangWhere — andres private tester gir 404),
 * protocol-JSON tolkes via parseProtocol (zod safeParse) og normaliseres til
 * ScorekortSpec; eldre tester uten protocol får fallback (ett tallfelt
 * «Score»). Paper-port PP-3 (2026-08-11): fasiten playerhq-test-gjennomfor.html
 * er ETT skjermbilde — protokoll + scorekort på samme flate, ingen stegmaskin.
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

  // Forrige resultat for samme test — kilden til «Foreslått mål» og
  // «Hvorfor dette tallet» (fasit: forrige resultat + IUP + forbehold).
  const forrige = await prisma.testResult.findFirst({
    where: { userId: user.id, testId: test.id },
    orderBy: { takenAt: "desc" },
    select: { score: true, takenAt: true },
  });

  const spec = parseProtocol(test.protocol) ?? fallbackScorekortSpec();
  return (
    <div data-paper-wave-d="test-gjennomfor" style={{ minHeight: "100dvh", background: T.bg, color: T.fg, fontFamily: T.ui }}>
      <div
        className="mx-auto w-full max-w-[460px] px-4 pb-8 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6"
        style={{ paddingTop: "calc(12px + env(safe-area-inset-top))" }}
      >
        {/* Paper .topp — fasit playerhq-test-gjennomfor.html */}
        <header data-paper-topp style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 4 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontWeight: 600, fontSize: 17, lineHeight: 1.2, color: T.fg }}>
              Test
            </h1>
            <span style={{ display: "block", marginTop: 2, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
              {test.name} · {test.pyramidArea}
            </span>
          </div>
        </header>
        <div style={{ maxWidth: 680 }}>
          <ScorekortKlient
            testId={test.id}
            beskrivelse={test.description}
            scoringRule={test.scoringRule}
            omraade={test.pyramidArea}
            sist={
              forrige
                ? {
                    score: forrige.score,
                    dato: new Intl.DateTimeFormat("nb-NO", {
                      timeZone: "Europe/Oslo",
                      day: "2-digit",
                      month: "2-digit",
                    }).format(forrige.takenAt),
                  }
                : null
            }
            spec={spec}
            protocol={test.protocol}
          />
        </div>
      </div>
    </div>
  );
}
