// drill-forslag: finner stallens svakeste SG-område (snitt siste 60 dager).
//
// HARD LAW (Masterbrain): Så lenge ovelsesbank/godkjent/ ikke har godkjente
// elementer, genereres INGEN drill-navn (verken Claude, YouTube eller demo).
// Agenten rapporterer DRILL_BANK_EMPTY og lagrer ingen CaddieDraft.
//
// Når banken har FASIT-drills: agenten foreslår kun id-er fra
// ovelsesbank/godkjent, og filtrerer på spillerens registrerte fasiliteter.
// YouTube kan senere knyttes til kjent id — aldri opprette ny id.
//
// Historikk: Før 2026-08-07 genererte denne agenten frie drill-navn via Claude
// og lagret dem som createDrillSuggestion. Det brøt never-invent-loven.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import {
  DRILL_BANK_EMPTY_CODE,
  DRILL_BANK_EMPTY_MELDING_NO,
  erMasterbrainDrillBankTom,
  foreslaGodkjenteOvelsesbankElementer,
  masterbrainDrillBankStatus,
  hentMasterbrainKunnskap,
  type MasterbrainFasilitetProfil,
} from "@/lib/masterbrain";

export const AGENT_NAME = "drill-forslag";
export const DRILL_DRAFT_TOOL = "createDrillSuggestion";

const DAGER = 60;

type SgKode = "OTT" | "APP" | "ARG" | "PUTT";

const LABEL: Record<SgKode, string> = {
  OTT: "Utslag (OTT)",
  APP: "Innspill (APP)",
  ARG: "Around-the-green (ARG)",
  PUTT: "Putting",
};

function snitt(verdier: Array<number | null>): number | null {
  const tall = verdier.filter((v): v is number => v !== null);
  if (tall.length === 0) return null;
  return tall.reduce((a, b) => a + b, 0) / tall.length;
}

async function hentFasilitetProfil(userId: string): Promise<MasterbrainFasilitetProfil> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tilgjengeligeFasiliteter: true,
      playerFacilities: {
        select: {
          name: true,
          capabilities: true,
          rangeLengdeM: true,
          maksPuttLengdeM: true,
        },
      },
    },
  });

  return {
    tilgjengeligeFasiliteter: user?.tilgjengeligeFasiliteter ?? [],
    playerFacilities:
      user?.playerFacilities.map((f) => ({
        name: f.name,
        capabilities: f.capabilities,
        rangeLengdeM: f.rangeLengdeM,
        maksPuttLengdeM: f.maksPuttLengdeM,
      })) ?? [],
  };
}

async function kjørDrillForslag(userId: string | null): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
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
    // Alle forslag under er begrenset til FASIT-id-er.
    const grense = new Date();
    grense.setDate(grense.getDate() - DAGER);

    const runder = await prisma.round.findMany({
      where: {
        playedAt: { gte: grense },
        sgTotal: { not: null },
        ...(userId ? { userId } : {}),
      },
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
    const profil = userId ? await hentFasilitetProfil(userId) : null;

    if (!profil) {
      return {
        output: {
          status: "krever-spillerprofil-for-fasilitetsfilter",
          invent_guard: "ok_no_freeform_generation",
          melding:
            "Masterbrain har godkjente øvelser, men global cron mangler spillerens fasilitetsprofil. Ingen personlige forslag lagres uten profil.",
          svakesteKategori: svakeste,
          svakesteLabel: LABEL[svakeste],
          svakesteSnitt: Number(svakesteVerdi.toFixed(2)),
          runderAnalysert: runder.length,
          antallDrills: bank.antall,
          forslagLagret: 0,
          driller: [],
        },
      };
    }

    const driller = foreslaGodkjenteOvelsesbankElementer({
      sgKode: svakeste,
      fasilitetProfil: profil,
      limit: 6,
    }).map((item) => ({
      id: item.id,
      navn: item.navn,
      type: item.type,
      pyramidArea: item.akFormel?.pyramidArea,
      omraade: item.akFormel?.omraade,
      dimensjon: item.akFormel?.dimensjon,
      treningstype: item.treningstype,
      fasilitetKrav: item.fasilitetKrav ?? [],
      facilityRequirements: item.facilityRequirements,
    }));

    return {
      output: {
        status: driller.length > 0 ? "forslag-fra-godkjentbank" : "ingen-fasilitetspassende-drills",
        invent_guard: "ok_no_freeform_generation",
        melding:
          driller.length > 0
            ? "Forslag er hentet fra Masterbrain sin godkjente øvelsesbank og filtrert mot spillerens fasiliteter."
            : "Ingen godkjente øvelser matchet både svakeste SG-område og spillerens registrerte fasiliteter.",
        svakesteKategori: svakeste,
        svakesteLabel: LABEL[svakeste],
        svakesteSnitt: Number(svakesteVerdi.toFixed(2)),
        runderAnalysert: runder.length,
        antallDrills: bank.antall,
        forslagLagret: 0,
        driller,
      },
    };
  });
}

export async function runDrillForslagForSpiller(userId: string): Promise<AgentResult> {
  return kjørDrillForslag(userId);
}

export async function runDrillForslag(): Promise<AgentResult> {
  return kjørDrillForslag(null);
}
