// drill-forslag: selvgående agent som finner stallens svakeste SG-område
// (snitt på tvers av spillere siste 60 dager) og ber Claude foreslå konkrete
// driller for å lukke gapet. Forslagene lagres i AgentRun.output og vises i
// Mission Control (/admin/agents/[agentId]) der coach kan vurdere dem.
//
// v1: forslag genereres fra AK Golf-kunnskap (Claude). Web-/YouTube-søk og
// direkte lagring til drill-biblioteket med godkjenningsflyt er neste steg
// (se memory "ovelsesbank-generator"). Demo-fallback uten ANTHROPIC_API_KEY.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { anthropic, AI_MODEL, AI_MAX_TOKENS, isAiEnabled } from "@/lib/ai/client";

export const AGENT_NAME = "drill-forslag";

const DAGER = 60;

type SgKode = "OTT" | "APP" | "ARG" | "PUTT";

const LABEL: Record<SgKode, string> = {
  OTT: "Tee-slag (OTT)",
  APP: "Innspill (APP)",
  ARG: "Around-the-green (ARG)",
  PUTT: "Putting",
};

const SYSTEM = `
Du er Drill-forslag-agent for AK Golf HQ.
Du foreslår konkrete, gjennomførbare treningsdriller for ett SG-område.

For hver drill:
- Navn (kort, beskrivende)
- Hva spilleren gjør (1-2 setninger)
- Måltall / suksesskriterium (konkret, målbart)

Foreslå nøyaktig 5 driller, nummerert. Norsk bokmål, ingen emoji, ingen utropstegn.
`.trim();

function snitt(verdier: Array<number | null>): number | null {
  const tall = verdier.filter((v): v is number => v !== null);
  if (tall.length === 0) return null;
  return tall.reduce((a, b) => a + b, 0) / tall.length;
}

export async function runDrillForslag(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const grense = new Date();
    grense.setDate(grense.getDate() - DAGER);

    const runder = await prisma.round.findMany({
      where: { playedAt: { gte: grense }, sgTotal: { not: null } },
      select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    });

    const snittPerKategori: Record<SgKode, number | null> = {
      OTT: snitt(runder.map((r) => r.sgOtt)),
      APP: snitt(runder.map((r) => r.sgApp)),
      ARG: snitt(runder.map((r) => r.sgArg)),
      PUTT: snitt(runder.map((r) => r.sgPutt)),
    };

    // Svakeste = laveste snitt (mest negativt SG). Hopp over kategorier uten data.
    const medData = (Object.entries(snittPerKategori) as Array<
      [SgKode, number | null]
    >).filter(([, v]) => v !== null) as Array<[SgKode, number]>;

    if (medData.length === 0) {
      return {
        output: {
          status: "ingen-sg-data",
          melding: `Ingen runder med SG-data siste ${DAGER} dager.`,
        },
      };
    }

    medData.sort((a, b) => a[1] - b[1]);
    const [svakeste, svakesteVerdi] = medData[0];

    const driller = await genererDriller(svakeste, svakesteVerdi, runder.length);

    return {
      output: {
        svakesteKategori: svakeste,
        svakesteLabel: LABEL[svakeste],
        svakesteSnitt: Number(svakesteVerdi.toFixed(2)),
        runderAnalysert: runder.length,
        snittPerKategori,
        driller,
      },
    };
  });
}

async function genererDriller(
  kode: SgKode,
  verdi: number,
  antallRunder: number,
): Promise<string> {
  if (!isAiEnabled() || !anthropic) {
    return demoDriller(kode);
  }
  const res = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Stallens svakeste SG-område er ${LABEL[kode]} (snitt ${verdi.toFixed(
          2,
        )} over ${antallRunder} runder, mot PGA-benchmark 0.0). Foreslå 5 driller for å forbedre dette området.`,
      },
    ],
  });
  const tekst = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();
  return tekst || demoDriller(kode);
}

function demoDriller(kode: SgKode): string {
  return [
    `Forslag for ${LABEL[kode]} (demo — sett ANTHROPIC_API_KEY for AI-genererte driller):`,
    "1. Måltrening med definert suksesskriterium per økt.",
    "2. Progressiv distanse-/lengdekontroll.",
    "3. Press-simulering: poeng-spill med konsekvens.",
    "4. Teknisk isolasjon av nøkkelbevegelse.",
    "5. Test-protokoll for å måle fremgang ukentlig.",
  ].join("\n");
}
