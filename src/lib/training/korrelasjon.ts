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
}

/** Pearson r mellom to like lange serier. Returnerer null ved < 2 par. */
export function beregnPearson(x: number[], y: number[]): number | null {
  const n = x.length;
  if (n < 2 || n !== y.length) return null;

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

/** Finner neste ISO-uke-streng. Handterer uke 52->01 og 53->01. */
function nesteIsoUke(uke: string): string {
  const [yearStr, wStr] = uke.split("-W");
  const year = parseInt(yearStr, 10);
  const w = parseInt(wStr, 10);
  // ISO-ar har 52 eller 53 uker - 28. des er alltid i siste ISO-uke av aret
  const dec28 = new Date(year, 11, 28);
  const lastWeek = Math.ceil(
    ((dec28.getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / 86400000 + 1) / 7,
  );
  if (w >= lastWeek) {
    return `${year + 1}-W01`;
  }
  return `${year}-W${String(w + 1).padStart(2, "0")}`;
}

/**
 * Kobler treningsuke N til SG-snitt uke N+1 per SG-omrade.
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
    if (sgNeste !== undefined) {
      par.push({
        uke: t.uke,
        sgArea: t.sgArea,
        minutterTreningsuke: t.minutter,
        sgEndringNesteUke: sgNeste,
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
  const treningUker = aggregerVolumPerUke(treningLogger, uker + 1, now);

  const runder = await prisma.round.findMany({
    where: {
      userId,
      playedAt: { gte: grense },
      sgTotal: { not: null },
    },
    select: { playedAt: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    orderBy: { playedAt: "asc" },
  });

  function isoUkeNummer(dato: Date): string {
    const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
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

    return { sgArea: omraade, r, datapunkter: par.length, tolkning };
  });
}
