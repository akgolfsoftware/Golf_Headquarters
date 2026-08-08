// drill-forslag: finner stallens svakeste SG-område (snitt siste 60 dager).
//
// HARD LAW (Masterbrain): Så lenge knowledge/entities/drills.json er TOM,
// genereres INGEN drill-navn (verken Claude, YouTube eller demo). Agenten
// rapporterer DRILL_BANK_EMPTY og lagrer ingen CaddieDraft.
//
// Når banken har FASIT-drills: fremtidig versjon skal kun foreslå id-er fra
// entities (ikke finne på navn). YouTube kan da knyttes til kjent id — aldri
// opprette ny id.
//
// Historikk: Før 2026-08-07 genererte denne agenten frie drill-navn via Claude
// og lagret dem som createDrillSuggestion. Det brøt never-invent-loven.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import {
  DRILL_BANK_EMPTY_CODE,
  DRILL_BANK_EMPTY_MELDING_NO,
  erMasterbrainDrillBankTom,
  masterbrainDrillBankStatus,
  hentMasterbrainKunnskap,
} from "@/lib/masterbrain";

export const AGENT_NAME = "drill-forslag";
export const DRILL_DRAFT_TOOL = "createDrillSuggestion";

const DAGER = 60;

type SgKode = "OTT" | "APP" | "ARG" | "PUTT";

const LABEL: Record<SgKode, string> = {
  OTT: "Tee-slag (OTT)",
  APP: "Innspill (APP)",
  ARG: "Around-the-green (ARG)",
  PUTT: "Putting",
};

function snitt(verdier: Array<number | null>): number | null {
  const tall = verdier.filter((v): v is number => v !== null);
  if (tall.length === 0) return null;
  return tall.reduce((a, b) => a + b, 0) / tall.length;
}

export async function runDrillForslag(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    // P0 invent-guard — før all SG-analyse og før Claude/YouTube.
    if (erMasterbrainDrillBankTom()) {
      const bank = masterbrainDrillBankStatus();
      const fasit = hentMasterbrainKunnskap("drill-forslag");
      return {
        output: {
          status: DRILL_BANK_EMPTY_CODE,
          invent_guard: "blocked_empty_bank",
          melding: DRILL_BANK_EMPTY_MELDING_NO,
          agentRegel: bank.agentRegel,
          bankStatus: bank.status,
          antallDrills: bank.antall,
          masterbrain_versjonsnokkel: fasit.versjonsnokkel,
          forslagLagret: 0,
          driller: [],
        },
      };
    }

    // Bank har innhold: fortsatt ingen fritekst-generering i denne versjonen.
    // Før invent-LLM tas tilbake må forslag være begrenset til FASIT-id-er.
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
          forslagLagret: 0,
          driller: [],
        },
      };
    }

    medData.sort((a, b) => a[1] - b[1]);
    const [svakeste, svakesteVerdi] = medData[0];
    const bank = masterbrainDrillBankStatus();

    return {
      output: {
        status: "bank-har-drills-men-forslag-ikke-implementert",
        invent_guard: "ok_no_freeform_generation",
        melding:
          "Masterbrain har drills, men automatisk forslag er begrenset til manuell promote til fasiten. Ingen fritekst-generering.",
        svakesteKategori: svakeste,
        svakesteLabel: LABEL[svakeste],
        svakesteSnitt: Number(svakesteVerdi.toFixed(2)),
        runderAnalysert: runder.length,
        antallDrills: bank.antall,
        forslagLagret: 0,
        driller: [],
      },
    };
  });
}
