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
import { parseSessionScoring, tilScorekortState } from "@/lib/portal-tester/session-data";
import {
  detectLiveArtefaktKind,
  gateMaalFraProtokoll,
  harMissSideFelt,
  liveArtefaktShots,
  peiMalAvstandNokkel,
  peiStartMalAvstand,
  peiTillMalNokkel,
  tomtGateForsok,
  tomtPeiForsok,
  type GateForsok,
  type PeiForsok,
} from "@/lib/domain/tester-live";
import { T } from "@/lib/v2/tokens";
import { ScorekortKlient } from "./scorekort-klient";
import { GateLiveArtefakt } from "./gate-live-artefakt";
import { PeiLiveArtefakt } from "./pei-live-artefakt";

/** Norsk desimal-parsing («12,4» → 12.4). Tom/ugyldig → null. Speiler scorekort-klient.tsx. */
function parseNorskTall(raw: string): number | null {
  const n = Number(raw.trim().replace("−", "-").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Bygger Gate-gjenopptaksstate fra en pågående økts lagrede `verdier` (T5-formatet). */
function gateGjenopptakFraVerdier(
  verdier: Record<number, Record<string, string | boolean>>,
  shots: number,
): GateForsok[] {
  const ut = tomtGateForsok(shots);
  for (let i = 0; i < shots; i++) {
    const rad = verdier[i + 1];
    if (!rad) continue;
    const ok = typeof rad.ok === "boolean" ? rad.ok : null;
    const side = rad.miss_side === "V" || rad.miss_side === "H" ? rad.miss_side : null;
    ut[i] = { ok, side };
  }
  return ut;
}

/** Bygger PEI-gjenopptaksstate fra en pågående økts lagrede `verdier` (T5-formatet). */
function peiGjenopptakFraVerdier(
  verdier: Record<number, Record<string, string | boolean>>,
  shots: number,
  malAvstandNokkel: string,
  tillMalNokkel: string,
): PeiForsok[] {
  const ut = tomtPeiForsok(shots);
  for (let i = 0; i < shots; i++) {
    const rad = verdier[i + 1];
    if (!rad) continue;
    const malRaw = rad[malAvstandNokkel];
    const tillRaw = rad[tillMalNokkel];
    ut[i] = {
      malAvstandM: typeof malRaw === "string" ? parseNorskTall(malRaw) : null,
      tillMalM: typeof tillRaw === "string" ? parseNorskTall(tillRaw) : null,
    };
  }
  return ut;
}

export const dynamic = "force-dynamic";

export default async function GjennomforTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  // TALENT: testene er åpne for gratisprofilen (T2-gaten slipper TALENT gjennom).
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
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
  // Pågående økt (TestSession IN_PROGRESS) gjenopptas: de førte forsøkene
  // legges inn som utgangsstate i scorekortet (T5).
  const [forrige, paagaaende] = await Promise.all([
    prisma.testResult.findFirst({
      where: { userId: user.id, testId: test.id },
      orderBy: { takenAt: "desc" },
      select: { score: true, takenAt: true },
    }),
    prisma.testSession.findFirst({
      where: { userId: user.id, testId: test.id, status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
      select: { id: true, scoringData: true },
    }),
  ]);

  const spec = parseProtocol(test.protocol) ?? fallbackScorekortSpec();
  const gjenopptak = paagaaende
    ? {
        sessionId: paagaaende.id,
        verdier: tilScorekortState(parseSessionScoring(paagaaende.scoringData)),
      }
    : null;

  // C4/Loop 8 — gate-/PEI-protokoller får det dedikerte live-artefaktet
  // (TE-04/05/06). Andre protokolltyper er urørt: ScorekortKlient under.
  const liveKind = detectLiveArtefaktKind(test.protocol);
  if (liveKind === "gate") {
    const shots = liveArtefaktShots(test.protocol);
    return (
      <GateLiveArtefakt
        testId={test.id}
        sessionId={gjenopptak?.sessionId ?? null}
        gjenopptattForsok={gjenopptak ? gateGjenopptakFraVerdier(gjenopptak.verdier, shots) : null}
        caption={`TEST · ${test.name.toUpperCase()}`}
        shots={shots}
        hasMissSide={harMissSideFelt(test.protocol)}
        maal={gateMaalFraProtokoll(test.protocol)}
        forrigeScore={forrige?.score ?? null}
      />
    );
  }
  if (liveKind === "pei") {
    const shots = liveArtefaktShots(test.protocol);
    const malAvstandNokkel = peiMalAvstandNokkel(test.protocol);
    const tillMalNokkel = peiTillMalNokkel(test.protocol);
    return (
      <PeiLiveArtefakt
        testId={test.id}
        sessionId={gjenopptak?.sessionId ?? null}
        gjenopptattForsok={
          gjenopptak
            ? peiGjenopptakFraVerdier(gjenopptak.verdier, shots, malAvstandNokkel, tillMalNokkel)
            : null
        }
        caption={`TEST · ${test.name.toUpperCase()} · ${shots} SLAG`}
        shots={shots}
        malAvstandNokkel={malAvstandNokkel}
        tillMalNokkel={tillMalNokkel}
        startMalAvstand={peiStartMalAvstand(test.protocol)}
      />
    );
  }

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
            gjenopptak={gjenopptak}
          />
        </div>
      </div>
    </div>
  );
}
