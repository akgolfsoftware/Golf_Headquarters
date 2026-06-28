// drill-forslag: selvgående agent som finner stallens svakeste SG-område
// (snitt på tvers av spillere siste 60 dager) og ber Claude foreslå konkrete
// driller. Hvert forslag lagres som CaddieDraft (PENDING) og vises på
// /admin/drills/forslag der coach godkjenner (→ ExerciseDefinition i biblioteket)
// eller avviser med ett klikk.
//
// v1: forslag genereres fra AK Golf-kunnskap (Claude). Web-/YouTube-søk er
// neste steg (se memory "ovelsesbank-generator"). Demo-fallback uten API-key.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { anthropic, AI_MODEL, AI_MAX_TOKENS, isAiEnabled } from "@/lib/ai/client";

export const AGENT_NAME = "drill-forslag";
export const DRILL_DRAFT_TOOL = "createDrillSuggestion";

const DAGER = 60;
const ANTALL_DRILLER = 5;

type SgKode = "OTT" | "APP" | "ARG" | "PUTT";

const LABEL: Record<SgKode, string> = {
  OTT: "Tee-slag (OTT)",
  APP: "Innspill (APP)",
  ARG: "Around-the-green (ARG)",
  PUTT: "Putting",
};

// SG-område → SkillArea-enum i ExerciseDefinition.
const SKILL_AREA: Record<SgKode, string> = {
  OTT: "TEE_TOTAL",
  APP: "TILNAERMING",
  ARG: "AROUND_GREEN",
  PUTT: "PUTTING",
};

// Forslag fra drill-agenten er alltid slag-rettet.
const PYRAMID_AREA = "SLAG";

type DrillForslag = {
  navn: string;
  beskrivelse: string;
  varighetMin: number;
  maaltall: string;
};

const SYSTEM = `
Du er Drill-forslag-agent for AK Golf HQ.
Du foreslår konkrete, gjennomførbare treningsdriller for ett SG-område.

Svar KUN med gyldig JSON: en array av nøyaktig ${ANTALL_DRILLER} objekter med feltene
"navn" (kort), "beskrivelse" (1-2 setninger om hva spilleren gjør), "varighetMin"
(heltall minutter), "maaltall" (konkret, målbart suksesskriterium).
Norsk bokmål. Ingen emoji, ingen utropstegn, ingen tekst utenfor JSON-arrayen.
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

    const medData = (
      Object.entries(snittPerKategori) as Array<[SgKode, number | null]>
    ).filter(([, v]) => v !== null) as Array<[SgKode, number]>;

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

    const driller = await genererDriller(
      svakeste,
      svakesteVerdi,
      runder.length,
    );

    // Lagre som PENDING-forslag for hver ADMIN-coach. Idempotent: rydd bort
    // forrige runde med ubehandlede drill-forslag før nye lages.
    const adminer = await prisma.user.findMany({
      where: { role: "ADMIN", deletedAt: null },
      select: { id: true },
    });

    let lagret = 0;
    for (const admin of adminer) {
      await prisma.caddieDraft.deleteMany({
        where: {
          userId: admin.id,
          toolName: DRILL_DRAFT_TOOL,
          status: "PENDING",
        },
      });
      for (const d of driller) {
        await prisma.caddieDraft.create({
          data: {
            userId: admin.id,
            conversationId: "drill-forslag-agent",
            toolCallId: `drill_${svakeste}_${lagret}_${admin.id.slice(-6)}`,
            toolName: DRILL_DRAFT_TOOL,
            toolInput: {
              name: d.navn,
              description: `${d.beskrivelse}\n\nMåltall: ${d.maaltall}`,
              skillArea: SKILL_AREA[svakeste],
              pyramidArea: PYRAMID_AREA,
              durationMin: d.varighetMin,
              svakesteKategori: svakeste,
            },
            previewText: `${d.navn} — ${LABEL[svakeste]} (${d.varighetMin} min)`,
            status: "PENDING",
          },
        });
        lagret++;
      }
    }

    return {
      output: {
        svakesteKategori: svakeste,
        svakesteLabel: LABEL[svakeste],
        svakesteSnitt: Number(svakesteVerdi.toFixed(2)),
        runderAnalysert: runder.length,
        forslagLagret: lagret,
        coacher: adminer.length,
        driller,
      },
    };
  });
}

async function genererDriller(
  kode: SgKode,
  verdi: number,
  antallRunder: number,
): Promise<DrillForslag[]> {
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
        )} over ${antallRunder} runder, mot PGA-benchmark 0.0). Foreslå ${ANTALL_DRILLER} driller for å forbedre dette området.`,
      },
    ],
  });
  const tekst = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();
  return parseDriller(tekst, kode);
}

// Defensiv parsing: trekk ut JSON-arrayen og valider hvert felt. Faller tilbake
// til demo-driller hvis modellen returnerer noe uventet.
function parseDriller(tekst: string, kode: SgKode): DrillForslag[] {
  const start = tekst.indexOf("[");
  const slutt = tekst.lastIndexOf("]");
  if (start === -1 || slutt === -1 || slutt <= start) return demoDriller(kode);
  let rå: unknown;
  try {
    rå = JSON.parse(tekst.slice(start, slutt + 1));
  } catch {
    return demoDriller(kode);
  }
  if (!Array.isArray(rå)) return demoDriller(kode);

  const gyldige: DrillForslag[] = [];
  for (const item of rå) {
    if (item === null || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const navn = typeof o.navn === "string" ? o.navn.trim() : "";
    const beskrivelse =
      typeof o.beskrivelse === "string" ? o.beskrivelse.trim() : "";
    const maaltall = typeof o.maaltall === "string" ? o.maaltall.trim() : "";
    const varighetMin =
      typeof o.varighetMin === "number" && Number.isFinite(o.varighetMin)
        ? Math.max(5, Math.min(120, Math.round(o.varighetMin)))
        : 20;
    if (navn && beskrivelse) {
      gyldige.push({ navn, beskrivelse, maaltall: maaltall || "—", varighetMin });
    }
  }
  return gyldige.length > 0 ? gyldige : demoDriller(kode);
}

function demoDriller(kode: SgKode): DrillForslag[] {
  return [
    {
      navn: `Måltrening — ${LABEL[kode]}`,
      beskrivelse:
        "Definert suksesskriterium per økt (demo — sett ANTHROPIC_API_KEY for AI-genererte driller).",
      varighetMin: 20,
      maaltall: "8 av 10 innenfor målsone",
    },
  ];
}
