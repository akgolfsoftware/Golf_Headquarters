// Agent: SG Interpretation — tolker Strokes Gained-data for en spiller.
//
// Henter siste N runder, beregner snitt per kategori (OTT/APP/ARG/PUTT),
// klassifiserer trend (OPP/FLAT/NED) og foreslår 3-5 drills å trene basert
// på svakeste kategori.

import "server-only";
import { anthropic, AI_MODEL, AI_MAX_TOKENS, isAiEnabled } from "../client";
import { sgInterpretationSkill } from "../skills/sg-interpretation";
import { prisma } from "@/lib/prisma";

export const SG_INTERPRETATION_SYSTEM = `
Du er SG Interpretation-agent for AK Golf HQ.
Du tolker Strokes Gained-data og gir konkrete anbefalinger.

For hver SG-kategori, vurder:
- Verdi (mot PGA-benchmark = 0.0)
- Trend (OPP / FLAT / NED) basert på lineær regresjon over siste runder
- En 1-setnings tolkning

Til slutt: identifiser svakeste kategori og foreslå 3-5 navngitte drills.

Norsk bokmål, profesjonell tone, ingen emoji, ingen utropstegn.

KUNNSKAP:
${sgInterpretationSkill.knowledge}
`.trim();

export type SgTrend = "OPP" | "FLAT" | "NED";
export type SgKategoriKode = "OTT" | "APP" | "ARG" | "PUTT";

export type SgKategoriTolkning = {
  verdi: number | null;
  tolkning: string;
  trend: SgTrend;
};

export type SgInterpretationResult = {
  spillerId: string;
  spillerNavn: string;
  runderTatt: number;
  sammendrag: string;
  perKategori: {
    ott: SgKategoriTolkning;
    app: SgKategoriTolkning;
    arg: SgKategoriTolkning;
    putt: SgKategoriTolkning;
  };
  svakesteKategori: SgKategoriKode | null;
  anbefalteDrills: string[];
};

export async function tolkSg(
  spillerId: string,
): Promise<SgInterpretationResult> {
  const spiller = await prisma.user.findUnique({
    where: { id: spillerId },
    select: { id: true, name: true, hcp: true },
  });
  if (!spiller) {
    throw new Error(`Spiller ikke funnet: ${spillerId}`);
  }

  // Hent siste 10 runder.
  const runder = await prisma.round.findMany({
    where: { userId: spillerId },
    orderBy: { playedAt: "desc" },
    take: 10,
    select: {
      playedAt: true,
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
      sgTotal: true,
    },
  });

  const perKategori = {
    ott: tolkKategori(runder, "sgOtt", "OTT"),
    app: tolkKategori(runder, "sgApp", "APP"),
    arg: tolkKategori(runder, "sgArg", "ARG"),
    putt: tolkKategori(runder, "sgPutt", "PUTT"),
  };

  const svakesteKategori = finnSvakeste(perKategori);
  const anbefalteDrills = await foreslaDrills(svakesteKategori);

  // Demo-fallback uten Claude.
  if (!isAiEnabled() || !anthropic) {
    return {
      spillerId: spiller.id,
      spillerNavn: spiller.name,
      runderTatt: runder.length,
      sammendrag: byggDemoSammendrag(spiller.name, runder.length, perKategori, svakesteKategori),
      perKategori,
      svakesteKategori,
      anbefalteDrills,
    };
  }

  const userPrompt = byggUserPrompt(spiller.name, runder.length, perKategori, svakesteKategori);
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    system: SG_INTERPRETATION_SYSTEM,
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
    runderTatt: runder.length,
    sammendrag: text || byggDemoSammendrag(spiller.name, runder.length, perKategori, svakesteKategori),
    perKategori,
    svakesteKategori,
    anbefalteDrills,
  };
}

// ---------- Hjelpere ----------

function tolkKategori(
  runder: Array<{ sgOtt: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null; playedAt: Date }>,
  felt: "sgOtt" | "sgApp" | "sgArg" | "sgPutt",
  navn: string,
): SgKategoriTolkning {
  const verdier = runder
    .map((r) => r[felt])
    .filter((v): v is number => v !== null);

  if (verdier.length === 0) {
    return {
      verdi: null,
      tolkning: `Ingen ${navn}-data registrert`,
      trend: "FLAT",
    };
  }

  const snitt = verdier.reduce((a, b) => a + b, 0) / verdier.length;
  const trend = beregnTrend(verdier);
  const tolkning = byggKategoriTolkning(navn, snitt, trend);

  return {
    verdi: Number(snitt.toFixed(2)),
    tolkning,
    trend,
  };
}

/**
 * Beregn lineær trend av verdier (eldst først → nyest sist).
 * Returnerer OPP / FLAT / NED basert på regresjons-koeffisient.
 */
function beregnTrend(verdier: number[]): SgTrend {
  if (verdier.length < 3) return "FLAT";

  // Runder kommer i rekkefølge nyest først → reverser.
  const reversed = [...verdier].reverse();
  const n = reversed.length;
  const xMean = (n - 1) / 2;
  const yMean = reversed.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (reversed[i] - yMean);
    den += (i - xMean) ** 2;
  }
  if (den === 0) return "FLAT";
  const slope = num / den;

  // Terskel: 0.05 strokes per runde = signifikant bevegelse.
  if (slope > 0.05) return "OPP";
  if (slope < -0.05) return "NED";
  return "FLAT";
}

function byggKategoriTolkning(
  navn: string,
  snitt: number,
  trend: SgTrend,
): string {
  let nivaa: string;
  if (snitt > 0) nivaa = "over PGA-benchmark";
  else if (snitt > -1) nivaa = "nær PGA-benchmark";
  else if (snitt > -3) nivaa = "PRO-amatør-nivå";
  else if (snitt > -5) nivaa = "A-amatør-nivå";
  else nivaa = "B-amatør-nivå";

  const trendTekst =
    trend === "OPP"
      ? "stigende"
      : trend === "NED"
        ? "fallende"
        : "stabil";

  return `SG-${navn} ${snitt.toFixed(2)} (${nivaa}), trend ${trendTekst}`;
}

function finnSvakeste(perKategori: {
  ott: SgKategoriTolkning;
  app: SgKategoriTolkning;
  arg: SgKategoriTolkning;
  putt: SgKategoriTolkning;
}): SgKategoriKode | null {
  const kandidater: Array<[SgKategoriKode, number]> = [];
  if (perKategori.ott.verdi !== null) kandidater.push(["OTT", perKategori.ott.verdi]);
  if (perKategori.app.verdi !== null) kandidater.push(["APP", perKategori.app.verdi]);
  if (perKategori.arg.verdi !== null) kandidater.push(["ARG", perKategori.arg.verdi]);
  if (perKategori.putt.verdi !== null) kandidater.push(["PUTT", perKategori.putt.verdi]);

  if (kandidater.length === 0) return null;
  kandidater.sort((a, b) => a[1] - b[1]);
  return kandidater[0][0];
}

async function foreslaDrills(
  kategori: SgKategoriKode | null,
): Promise<string[]> {
  if (!kategori) {
    return [];
  }

  // Map SG-kategori → SkillArea i ExerciseDefinition.
  const skillArea =
    kategori === "OTT"
      ? "TEE_TOTAL"
      : kategori === "APP"
        ? "TILNAERMING"
        : kategori === "ARG"
          ? "AROUND_GREEN"
          : "PUTTING";

  const drills = await prisma.exerciseDefinition.findMany({
    where: { skillArea },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { name: true },
  });

  if (drills.length === 0) {
    // Fallback til generiske drill-navn per kategori.
    return generiskeDrills(kategori);
  }

  return drills.map((d) => d.name);
}

function generiskeDrills(kategori: SgKategoriKode): string[] {
  switch (kategori) {
    case "OTT":
      return [
        "Driver fairway-strek",
        "9-skudd driver",
        "Tempo-drill (1-2-3-stopp)",
        "Tee-høyde-variasjon",
      ];
    case "APP":
      return [
        "150m-trekant",
        "Avstands-kontroll 100-150m",
        "Jern-spredning per klubb",
        "Wedge-yardage 50/70/90",
      ];
    case "ARG":
      return [
        "Chip-til-3-fot",
        "Bunker basic",
        "Pitch-50m-stopper",
        "Lie-rotasjon (gress/sand/rough)",
      ];
    case "PUTT":
      return [
        "Klokkedrill 4-fot",
        "Lag-putt 10-25m",
        "Linje-lesing fra 5 vinkler",
        "Speedkontroll til frans",
      ];
  }
}

// ---------- Prompts og demo ----------

function byggUserPrompt(
  navn: string,
  runderTatt: number,
  perKategori: {
    ott: SgKategoriTolkning;
    app: SgKategoriTolkning;
    arg: SgKategoriTolkning;
    putt: SgKategoriTolkning;
  },
  svakeste: SgKategoriKode | null,
): string {
  return `
Tolk SG-data for ${navn} (siste ${runderTatt} runder).

OTT: ${perKategori.ott.verdi ?? "n/a"} (trend ${perKategori.ott.trend})
APP: ${perKategori.app.verdi ?? "n/a"} (trend ${perKategori.app.trend})
ARG: ${perKategori.arg.verdi ?? "n/a"} (trend ${perKategori.arg.trend})
PUTT: ${perKategori.putt.verdi ?? "n/a"} (trend ${perKategori.putt.trend})

Svakeste: ${svakeste ?? "ingen data"}

Skriv et sammendrag på 2-3 setninger som forklarer hovedmønsteret.
`.trim();
}

function byggDemoSammendrag(
  navn: string,
  runderTatt: number,
  perKategori: {
    ott: SgKategoriTolkning;
    app: SgKategoriTolkning;
    arg: SgKategoriTolkning;
    putt: SgKategoriTolkning;
  },
  svakeste: SgKategoriKode | null,
): string {
  if (runderTatt === 0) {
    return `${navn} har ingen runder registrert ennå. Logg første runde for å få SG-tolkning.`;
  }
  const linjer: string[] = [];
  linjer.push(
    `${navn} har ${runderTatt} runde(r) registrert. ${perKategori.ott.tolkning}.`,
  );
  if (svakeste) {
    const k = perKategori[svakeste.toLowerCase() as "ott" | "app" | "arg" | "putt"];
    linjer.push(
      `Svakeste kategori er SG-${svakeste} (${k.verdi}). ${k.tolkning}.`,
    );
  }
  return linjer.join(" ");
}
