import { SG_ANALYSE_SELECT, sgSammenligningsnokkel } from "@/lib/ai-plan/analyse-grunnlag";
import type { SgCategory } from "@/generated/prisma/client";
import type { UkeVolum } from "./volum";

export interface SgUke {
  uke: string;
  sgArea: SgCategory;
  snittSg: number;
}

export interface TreningOgSgPar {
  uke: string;
  sgArea: SgCategory;
  minutterTreningsuke: number;
  sgEndringNesteUke: number;
}

export interface KorrelasjonsResultat {
  sgArea: SgCategory;
  r: number | null;
  datapunkter: number;
  tolkning: "positiv" | "negativ" | "ingen" | "for_lite_data";
  /** Beskrivende sammenheng; ikke bevis for at treningen forårsaket endringen. */
  evidens: "observasjon";
  kilde: "training-log-sg";
  begrensning: string;
}

/** Pearson r mellom to like lange serier. Returnerer null ved < 2 par. */
export function beregnPearson(x: number[], y: number[]): number | null {
  const n = x.length;
  if (n < 2 || n !== y.length || ![...x, ...y].every(Number.isFinite)) return null;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let teller = 0;
  let ssX = 0;
  let ssY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    teller += dx * dy;
    ssX += dx * dx;
    ssY += dy * dy;
  }

  if (ssX === 0 || ssY === 0) return null;
  return teller / Math.sqrt(ssX * ssY);
}

/** ISO-året følger torsdagen i uken. UTC gjør årsskiftet tidssoneuavhengig. */
function nesteIsoUke(uke: string): string | null {
  const match = /^(\d{4})-W(\d{2})$/.exec(uke);
  if (!match) return null;
  const year = Number(match[1]), week = Number(match[2]);
  if (week < 1 || week > 53) return null;
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const monday = new Date(jan4.getTime() + ((week - 1) * 7 - ((jan4.getUTCDay() + 6) % 7)) * 86400000);
  const format = (date: Date) => {
    const thursday = new Date(date);
    thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
    const y = thursday.getUTCFullYear();
    const w = Math.ceil(((thursday.getTime() - Date.UTC(y, 0, 1)) / 86400000 + 1) / 7);
    return `${y}-W${String(w).padStart(2, "0")}`;
  };
  if (format(monday) !== uke) return null;
  return format(new Date(monday.getTime() + 7 * 86400000));
}

/**
 * Kobler treningsuke N til SG-endring (N+1 minus N) per område.
 * Krever begge målinger; manglende grunnlinje er ikke null SG.
 */
export function koblTreningOgSg(
  treningUker: UkeVolum[],
  sgUker: SgUke[],
): TreningOgSgPar[] {
  const sgMap = new Map<string, number>();
  for (const s of sgUker) {
    sgMap.set(`${s.uke}::${s.sgArea}`, s.snittSg);
  }

  const par: TreningOgSgPar[] = [];
  for (const t of treningUker) {
    const neste = nesteIsoUke(t.uke);
    const sgNeste = sgMap.get(`${neste}::${t.sgArea}`);
    const sgNaa = sgMap.get(`${t.uke}::${t.sgArea}`);
    if (neste && sgNeste !== undefined && sgNaa !== undefined &&
      [sgNeste, sgNaa, t.minutter].every(Number.isFinite) && t.minutter >= 0) {
      par.push({
        uke: t.uke,
        sgArea: t.sgArea,
        minutterTreningsuke: t.minutter,
        sgEndringNesteUke: sgNeste - sgNaa,
      });
    }
  }
  return par;
}

/** Beregner korrelasjon mellom ukentlig treningsvolum og SG neste uke per kategori. */
export async function beregnKorrelasjon(
  userId: string,
  uker: number = 16,
): Promise<KorrelasjonsResultat[]> {
  const { prisma } = await import("../prisma");
  const { aggregerVolumPerUke } = await import("./volum");

  const now = new Date();
  const grense = new Date(now);
  grense.setDate(grense.getDate() - (uker + 1) * 7);

  const treningLogger = await prisma.trainingLog.findMany({
    where: { userId, date: { gte: grense } },
    select: { date: true, sgArea: true, minutes: true },
  });
  // Logger uten SG-område (FYS/TEK/SPILL/TURN fra Logg økt) hører ikke til SG-volumet.
  const medSg = treningLogger.filter((l): l is typeof l & { sgArea: NonNullable<typeof l.sgArea> } => l.sgArea != null);
  const treningUker = aggregerVolumPerUke(medSg, uker + 1, now);

  const alleRunder = await prisma.round.findMany({
    where: {
      userId,
      playedAt: { gte: grense, lte: now },
      playStatus: "COMPLETED",
      partialSave: false,
      sgTotal: { not: null },
    },
    select: SG_ANALYSE_SELECT,
    orderBy: { playedAt: "asc" },
  });

  const siste = [...alleRunder].reverse().find(r => sgSammenligningsnokkel(r) !== null);
  const key = siste ? sgSammenligningsnokkel(siste) : null;
  const runder = key ? alleRunder.filter(r => sgSammenligningsnokkel(r) === key) : [];

  function isoUkeNummer(dato: Date): string {
    const d = new Date(Date.UTC(dato.getUTCFullYear(), dato.getUTCMonth(), dato.getUTCDate()));
    const dag = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dag);
    const year = d.getUTCFullYear();
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const uke = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7);
    return `${year}-W${String(uke).padStart(2, "0")}`;
  }

  const omraader: SgCategory[] = ["OTT", "APP", "ARG", "PUTT"];
  const ukeMap = new Map<string, Map<SgCategory, { sum: number; count: number }>>();

  for (const r of runder) {
    const uke = isoUkeNummer(r.playedAt);
    if (!ukeMap.has(uke)) {
      ukeMap.set(uke, new Map());
    }
    const entry = ukeMap.get(uke)!;
    const sgVerdier: Record<SgCategory, number | null> = {
      OTT: r.sgOtt,
      APP: r.sgApp,
      ARG: r.sgArg,
      PUTT: r.sgPutt,
    };
    for (const a of omraader) {
      const sg = sgVerdier[a];
      if (sg == null) continue;
      const prev = entry.get(a) ?? { sum: 0, count: 0 };
      entry.set(a, { sum: prev.sum + sg, count: prev.count + 1 });
    }
  }

  const sgUker: SgUke[] = [];
  for (const [uke, areaMap] of ukeMap.entries()) {
    for (const [sgArea, { sum, count }] of areaMap.entries()) {
      sgUker.push({ uke, sgArea, snittSg: sum / count });
    }
  }

  return omraader.map((omraade) => {
    const treningOmraade = treningUker.filter((t) => t.sgArea === omraade);
    const sgOmraade = sgUker.filter((s) => s.sgArea === omraade);
    const par = koblTreningOgSg(treningOmraade, sgOmraade);

    const r = beregnPearson(
      par.map((p) => p.minutterTreningsuke),
      par.map((p) => p.sgEndringNesteUke),
    );

    let tolkning: KorrelasjonsResultat["tolkning"];
    if (r === null || par.length < 4) {
      tolkning = "for_lite_data";
    } else if (r > 0.3) {
      tolkning = "positiv";
    } else if (r < -0.3) {
      tolkning = "negativ";
    } else {
      tolkning = "ingen";
    }

    return { sgArea: omraade, r, datapunkter: par.length, tolkning, evidens: "observasjon", kilde: "training-log-sg",
      begrensning: "Bare SG-merkede treningslogger. Uregistrert trening er ukjent. Beskrivende sammenheng, ikke årsakseffekt eller grunnlag for automatisk volumendring." };
  });
}
