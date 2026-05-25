// Agent: Performance Peaking — foreslår 4-6 ukers periodiserings-plan
// frem mot en spesifikk turnering. Bygger på Bompa-modellen tilpasset golf.
//
// Faser (rekkefølge når ukerTil >= 6):
//   GRUNNTRENING (uker -6) → OPPBYGGING → SPESIALISERING → TAPER (KONKURRANSE)
//
// For kortere vindu komprimeres modellen — siste 2 uker er alltid TAPER.

import "server-only";
import { anthropic, AI_MODEL, AI_MAX_TOKENS, isAiEnabled } from "../client";
import { bompaSkill } from "../skills/bompa-perioder";
import { pyramideSkill } from "../skills/pyramide-taksonomi";
import { prisma } from "@/lib/prisma";

export const PERFORMANCE_PEAKING_SYSTEM = `
Du er Performance Peaking-agent for AK Golf HQ.
Du foreslår en uke-for-uke periodiserings-plan frem mot en turnering.

For hver uke:
- Bompa-fase (GRUNNTRENING / OPPBYGGING / SPESIALISERING / KONKURRANSE / TAPER)
- Volum (LAVT / MIDDELS / HOYT)
- Intensitet (LAV / MIDDELS / HOY)
- Pyramide-fokus (prosent FYS/TEK/SLAG/SPILL/TURN — skal summere til 100)
- Rasjonale (1 setning hvorfor denne mixen for denne uka)

Til slutt: én avsluttende generell råd (2-3 setninger).

Norsk bokmål, ingen emoji, ingen utropstegn.

KUNNSKAP:
${pyramideSkill.knowledge}

${bompaSkill.knowledge}
`.trim();

export type BompaFase =
  | "GRUNNTRENING"
  | "OPPBYGGING"
  | "SPESIALISERING"
  | "KONKURRANSE"
  | "TAPER";

export type VolumNivaa = "LAVT" | "MIDDELS" | "HOYT";
export type IntensitetNivaa = "LAV" | "MIDDELS" | "HOY";

export type PyramidFokus = {
  fys: number;
  tek: number;
  slag: number;
  spill: number;
  turn: number;
};

export type FaseUke = {
  uke: number;
  bompaFase: BompaFase;
  volum: VolumNivaa;
  intensitet: IntensitetNivaa;
  pyramidFokus: PyramidFokus;
  rasjonale: string;
};

export type PeakingPlanResult = {
  spillerId: string;
  spillerNavn: string;
  tournamentId: string;
  tournamentNavn: string;
  startDato: string;
  ukerTilTurnering: number;
  fasePerUke: FaseUke[];
  generellRad: string;
};

export async function foreslaPeakingPlan(opts: {
  spillerId: string;
  tournamentId: string;
}): Promise<PeakingPlanResult> {
  const spiller = await prisma.user.findUnique({
    where: { id: opts.spillerId },
    select: { id: true, name: true, hcp: true },
  });
  if (!spiller) {
    throw new Error(`Spiller ikke funnet: ${opts.spillerId}`);
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: opts.tournamentId },
    select: { id: true, name: true, startDate: true },
  });
  if (!tournament) {
    throw new Error(`Turnering ikke funnet: ${opts.tournamentId}`);
  }

  const now = new Date();
  const dagerTil = Math.max(
    0,
    Math.floor(
      (tournament.startDate.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  const ukerTilTurnering = Math.max(1, Math.ceil(dagerTil / 7));

  // Bygg deterministisk plan først (brukes også som demo-fallback).
  const fasePerUke = byggFasePlan(ukerTilTurnering);
  const generellRadDemo = byggGenerellRadDemo(spiller.name, tournament.name, ukerTilTurnering);

  if (!isAiEnabled() || !anthropic) {
    return {
      spillerId: spiller.id,
      spillerNavn: spiller.name,
      tournamentId: tournament.id,
      tournamentNavn: tournament.name,
      startDato: tournament.startDate.toISOString(),
      ukerTilTurnering,
      fasePerUke,
      generellRad: generellRadDemo,
    };
  }

  // Med Claude — be om generell råd som tekst (planen er deterministisk).
  const userPrompt = byggUserPrompt(spiller, tournament, ukerTilTurnering, fasePerUke);
  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: AI_MAX_TOKENS,
      system: PERFORMANCE_PEAKING_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();
    return {
      spillerId: spiller.id,
      spillerNavn: spiller.name,
      tournamentId: tournament.id,
      tournamentNavn: tournament.name,
      startDato: tournament.startDate.toISOString(),
      ukerTilTurnering,
      fasePerUke,
      generellRad: text || generellRadDemo,
    };
  } catch {
    return {
      spillerId: spiller.id,
      spillerNavn: spiller.name,
      tournamentId: tournament.id,
      tournamentNavn: tournament.name,
      startDato: tournament.startDate.toISOString(),
      ukerTilTurnering,
      fasePerUke,
      generellRad: generellRadDemo,
    };
  }
}

// ---------- Fase-bygger (deterministisk Bompa-tilpasning) ----------

function byggFasePlan(ukerTil: number): FaseUke[] {
  const uker: FaseUke[] = [];

  // Plan-mønster basert på ukerTil:
  // 1 uke: TAPER full uke
  // 2 uker: SPESIALISERING -> TAPER
  // 3-4 uker: SPESIALISERING (n-2) + TAPER (2)
  // 5+ uker: GRUNN/OPPBYGGING (front) + SPESIALISERING (mid) + TAPER (siste 2)

  if (ukerTil <= 1) {
    uker.push({
      uke: 1,
      bompaFase: "TAPER",
      volum: "LAVT",
      intensitet: "LAV",
      pyramidFokus: { fys: 5, tek: 15, slag: 20, spill: 20, turn: 40 },
      rasjonale: "Konkurranseuken — kun touch og mental forberedelse",
    });
    return uker;
  }

  // Siste 2 uker = TAPER (uke n-1 = SPES-taper, uke n = full taper).
  // Begynnelsen håndteres avhengig av total.
  const totalUker = ukerTil;

  for (let i = 1; i <= totalUker; i++) {
    const ukerFraTurnering = totalUker - i; // 0 = konkurranseuken, 1 = uka før, osv.

    if (ukerFraTurnering === 0) {
      // Konkurranseuken — full taper.
      uker.push({
        uke: i,
        bompaFase: "TAPER",
        volum: "LAVT",
        intensitet: "LAV",
        pyramidFokus: { fys: 5, tek: 15, slag: 20, spill: 20, turn: 40 },
        rasjonale: "Konkurranseuken — kun touch og mental forberedelse",
      });
    } else if (ukerFraTurnering === 1) {
      // 1 uke før — taper-start.
      uker.push({
        uke: i,
        bompaFase: "TAPER",
        volum: "LAVT",
        intensitet: "MIDDELS",
        pyramidFokus: { fys: 10, tek: 20, slag: 25, spill: 25, turn: 20 },
        rasjonale: "Reduser volum, behold sleip følelse på slagene",
      });
    } else if (ukerFraTurnering <= 3 && totalUker >= 3) {
      // Spesialiserings-fase.
      uker.push({
        uke: i,
        bompaFase: "SPESIALISERING",
        volum: "MIDDELS",
        intensitet: "HOY",
        pyramidFokus: { fys: 15, tek: 25, slag: 30, spill: 20, turn: 10 },
        rasjonale: "Skarp prestasjon — slag-spesifikt og bane-simulering",
      });
    } else if (ukerFraTurnering <= 5 && totalUker >= 5) {
      // Oppbyggings-fase.
      uker.push({
        uke: i,
        bompaFase: "OPPBYGGING",
        volum: "HOYT",
        intensitet: "MIDDELS",
        pyramidFokus: { fys: 30, tek: 35, slag: 20, spill: 10, turn: 5 },
        rasjonale: "Progresjon — øker både volum og intensitet på tekniske mønstre",
      });
    } else {
      // Grunntrening (tidlig).
      uker.push({
        uke: i,
        bompaFase: "GRUNNTRENING",
        volum: "HOYT",
        intensitet: "LAV",
        pyramidFokus: { fys: 45, tek: 30, slag: 15, spill: 10, turn: 0 },
        rasjonale: "Fundament — bygg fysisk kapasitet og tekniske basisferdigheter",
      });
    }
  }

  return uker;
}

// ---------- Prompts og demo-tekst ----------

function byggUserPrompt(
  spiller: { name: string; hcp: number | null },
  tournament: { name: string; startDate: Date },
  ukerTil: number,
  fasePerUke: FaseUke[],
): string {
  const ukeLinjer = fasePerUke.map(
    (u) =>
      `Uke ${u.uke}: ${u.bompaFase} | vol ${u.volum} | int ${u.intensitet} | FYS ${u.pyramidFokus.fys}% TEK ${u.pyramidFokus.tek}% SLAG ${u.pyramidFokus.slag}% SPILL ${u.pyramidFokus.spill}% TURN ${u.pyramidFokus.turn}%`,
  );
  return `
Spiller: ${spiller.name} (HCP ${spiller.hcp ?? "ukjent"})
Turnering: ${tournament.name} (${tournament.startDate.toISOString().slice(0, 10)})
Uker til turnering: ${ukerTil}

Forslått plan:
${ukeLinjer.join("\n")}

Skriv en avsluttende generell råd (2-3 setninger) som oppsummerer hovedstrategien.
`.trim();
}

function byggGenerellRadDemo(
  navn: string,
  turnering: string,
  ukerTil: number,
): string {
  if (ukerTil <= 1) {
    return `${navn} må holde tempo lavt frem til ${turnering}. Kun touch på range, ingen tunge økter. Mental prep prioriteres — visualisering og rutiner.`;
  }
  if (ukerTil <= 3) {
    return `Kort vindu frem til ${turnering}. Hold spesialiserings-fasen skarp i de første ukene, så taper de siste 1-2 ukene. Hold fokus på bane-simulering og scoring.`;
  }
  if (ukerTil <= 6) {
    return `Du har ${ukerTil} uker frem til ${turnering}. Start med oppbygging av tekniske mønstre, gå deretter inn i spesialisering, og avslutt med taper-fase. Hold ${navn} på en konsistent søvn- og restitusjons-rutine gjennom hele perioden.`;
  }
  return `${navn} har god tid frem til ${turnering} (${ukerTil} uker). Bruk de første ukene til å bygge fundament (FYS + TEK), så gradvis dreining mot SLAG/SPILL i midten, og avslutt med 2 uker spesialisering + 2 uker taper. Sikre at HRV og restitusjon overvåkes ukentlig.`;
}
