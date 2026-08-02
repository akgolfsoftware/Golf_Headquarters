/**
 * Samlet treningshistorikk — golf og fysisk i ÉN tidslinje (2026-07-27).
 *
 * Én rad per gjennomført drill/øvelse, ikke per økt: det er drillen som bærer
 * pyramide, område, belastning og miljø, og det er de spilleren vil filtrere på
 * («hvor mye teknikk har jeg gjort på range vs på bane»).
 *
 * Erstatter to snarveier i den gamle analysen: hardkodet pyramidArea "SPILL" på
 * øktnivå (TrainingSessionV2 har ikke pyramide — drillene har det) og en
 * `* 0.2`-heuristikk for minutter per akse. Her brukes faktisk tid når den
 * finnes (actualDurationSec fra live-timeren), ellers planlagt varighet.
 *
 * Fysisk trening kommer fra en helt annen modellgren (FysOkt) og har verken
 * pyramide eller miljø — den legges inn som pyramide FYS med miljø null, slik
 * at den kan vises sammen med golf uten å late som den har data den ikke har.
 */
import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { miljoGruppe, type MiljoGruppe } from "@/lib/taxonomy";

const InputSchema = z.object({
  userId: z.string().min(1),
  fra: z.date(),
  til: z.date(),
});

export type TreningsKilde = "GOLF" | "FYS";

/** Én gjennomført drill/øvelse. */
export type TreningsRad = {
  id: string;
  /** Når økten startet (Oslo-korrekt vindusfiltrering skjer i spørringen). */
  dato: Date;
  kilde: TreningsKilde;
  oktId: string;
  oktTittel: string;
  navn: string;
  /** Faktisk brukt tid når den er målt, ellers planlagt. */
  minutter: number;
  /** True når minuttene er målt med live-timeren, ikke bare planlagt. */
  maalt: boolean;
  pyramide: string;
  omraade: string | null;
  miljo: string | null;
  miljoGruppe: MiljoGruppe | null;
  csNivaa: string | null;
  lFase: string | null;
};

export type TreningsFiltre = {
  kilde?: TreningsKilde | "ALLE";
  pyramide?: string[];
  omraade?: string[];
  csNivaa?: string[];
  miljoGrupper?: MiljoGruppe[];
};

/**
 * Henter alle gjennomførte treningsrader i vinduet, nyeste først.
 *
 * Filtrene brukes i minnet etter uthenting — datamengden er én spillers
 * historikk i ett tidsvindu, og det holder rikelig. Vinduet selv filtreres i
 * databasen, som er det som faktisk begrenser mengden.
 */
export async function hentTreningsHistorikk(input: {
  userId: string;
  fra: Date;
  til: Date;
  filtre?: TreningsFiltre;
}): Promise<TreningsRad[]> {
  const { userId, fra, til } = InputSchema.parse({
    userId: input.userId,
    fra: input.fra,
    til: input.til,
  });

  const [golfOkter, fysOkter] = await Promise.all([
    prisma.trainingSessionV2.findMany({
      where: {
        studentId: userId,
        status: "COMPLETED",
        startTime: { gte: fra, lt: til },
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        miljo: true,
        drills: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            actualDurationSec: true,
            pyramide: true,
            omraade: true,
            miljo: true,
            csNivaa: true,
            lFase: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
    }),
    // Fys-økter stemples av loggFysOkt. Uten stempel er økten ikke gjennomført.
    prisma.fysOkt.findMany({
      where: { gjennomfortAt: { gte: fra, lt: til } },
      select: {
        id: true,
        navn: true,
        type: true,
        gjennomfortAt: true,
        faktiskMinutter: true,
        estimertMinutter: true,
        uke: { select: { plan: { select: { userId: true } } } },
        rader: { select: { id: true, navn: true, muskelgruppe: true } },
      },
      orderBy: { gjennomfortAt: "desc" },
    }),
  ]);

  const rader: TreningsRad[] = [];

  for (const okt of golfOkter) {
    for (const d of okt.drills) {
      const maalt = d.actualDurationSec != null && d.actualDurationSec > 0;
      const kode = d.miljo ?? okt.miljo;
      rader.push({
        id: d.id,
        dato: okt.startTime,
        kilde: "GOLF",
        oktId: okt.id,
        oktTittel: okt.title,
        navn: d.name,
        minutter: maalt
          ? Math.max(1, Math.round(d.actualDurationSec! / 60))
          : d.durationMinutes,
        maalt,
        pyramide: d.pyramide,
        omraade: d.omraade,
        miljo: kode,
        miljoGruppe: miljoGruppe(kode),
        csNivaa: d.csNivaa,
        lFase: d.lFase,
      });
    }
  }

  for (const okt of fysOkter) {
    // Fys-planen eies via uke → plan; filtrer bort andres økter.
    if (okt.uke?.plan?.userId !== userId) continue;
    const total = okt.faktiskMinutter ?? okt.estimertMinutter ?? 0;
    if (okt.rader.length === 0) {
      rader.push({
        id: okt.id,
        dato: okt.gjennomfortAt!,
        kilde: "FYS",
        oktId: okt.id,
        oktTittel: okt.navn,
        navn: okt.navn,
        minutter: total,
        maalt: okt.faktiskMinutter != null,
        pyramide: "FYS",
        omraade: okt.type ?? null,
        miljo: null,
        miljoGruppe: null,
        csNivaa: null,
        lFase: null,
      });
      continue;
    }
    // Tiden fordeles likt på øvelsene — fys-logging måler ikke per øvelse.
    const perRad = Math.round(total / okt.rader.length);
    for (const r of okt.rader) {
      rader.push({
        id: r.id,
        dato: okt.gjennomfortAt!,
        kilde: "FYS",
        oktId: okt.id,
        oktTittel: okt.navn,
        navn: r.navn,
        minutter: perRad,
        maalt: okt.faktiskMinutter != null,
        pyramide: "FYS",
        omraade: r.muskelgruppe ?? okt.type ?? null,
        miljo: null,
        miljoGruppe: null,
        csNivaa: null,
        lFase: null,
      });
    }
  }

  rader.sort((a, b) => b.dato.getTime() - a.dato.getTime());
  return filtrerRader(rader, input.filtre);
}

/** Filtrering i minnet — ren funksjon, testes uten database. */
export function filtrerRader(
  rader: TreningsRad[],
  filtre?: TreningsFiltre,
): TreningsRad[] {
  if (!filtre) return rader;
  return rader.filter((r) => {
    if (filtre.kilde && filtre.kilde !== "ALLE" && r.kilde !== filtre.kilde) return false;
    if (filtre.pyramide?.length && !filtre.pyramide.includes(r.pyramide)) return false;
    if (filtre.omraade?.length && (!r.omraade || !filtre.omraade.includes(r.omraade))) {
      return false;
    }
    if (filtre.csNivaa?.length && (!r.csNivaa || !filtre.csNivaa.includes(r.csNivaa))) {
      return false;
    }
    if (
      filtre.miljoGrupper?.length &&
      (!r.miljoGruppe || !filtre.miljoGrupper.includes(r.miljoGruppe))
    ) {
      return false;
    }
    return true;
  });
}

export type HistorikkOppsummering = {
  totaltMinutter: number;
  antallRader: number;
  antallOkter: number;
  /** Andel av minuttene som er faktisk målt (ikke bare planlagt). */
  andelMaalt: number;
  perPyramide: { akse: string; minutter: number; andel: number }[];
  perMiljoGruppe: { gruppe: MiljoGruppe; minutter: number; andel: number }[];
  perOmraade: { omraade: string; minutter: number }[];
};

/** Aggregater for visningene. Ren funksjon — mates av hentTreningsHistorikk. */
export function oppsummer(rader: TreningsRad[]): HistorikkOppsummering {
  const totaltMinutter = rader.reduce((sum, r) => sum + r.minutter, 0);
  const maaltMin = rader.filter((r) => r.maalt).reduce((s, r) => s + r.minutter, 0);
  const andel = (min: number) => (totaltMinutter > 0 ? min / totaltMinutter : 0);

  const perAkse = new Map<string, number>();
  const perGruppe = new Map<MiljoGruppe, number>();
  const perOmr = new Map<string, number>();
  for (const r of rader) {
    perAkse.set(r.pyramide, (perAkse.get(r.pyramide) ?? 0) + r.minutter);
    if (r.miljoGruppe) {
      perGruppe.set(r.miljoGruppe, (perGruppe.get(r.miljoGruppe) ?? 0) + r.minutter);
    }
    if (r.omraade) perOmr.set(r.omraade, (perOmr.get(r.omraade) ?? 0) + r.minutter);
  }

  return {
    totaltMinutter,
    antallRader: rader.length,
    antallOkter: new Set(rader.map((r) => r.oktId)).size,
    andelMaalt: andel(maaltMin),
    perPyramide: [...perAkse.entries()]
      .map(([akse, minutter]) => ({ akse, minutter, andel: andel(minutter) }))
      .sort((a, b) => b.minutter - a.minutter),
    perMiljoGruppe: [...perGruppe.entries()]
      .map(([gruppe, minutter]) => ({ gruppe, minutter, andel: andel(minutter) }))
      .sort((a, b) => b.minutter - a.minutter),
    perOmraade: [...perOmr.entries()]
      .map(([omraade, minutter]) => ({ omraade, minutter }))
      .sort((a, b) => b.minutter - a.minutter)
      .slice(0, 12),
  };
}
