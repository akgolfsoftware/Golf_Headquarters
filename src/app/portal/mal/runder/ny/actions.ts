"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { sikreBaneBro } from "@/lib/portal/bane-bro";
import { parTemplate } from "@/lib/portal-runder/par-template";
import { synkroniserSgFraRunder } from "@/lib/portal-stats/sg-bro";
import { estimerHullFraTotal } from "@/lib/runde-logg/estimer-fra-total";
import { beregnSg } from "@/lib/domain/sg";
import { beregnGranulaerSg } from "@/lib/runde-logg/granulaer-sg";
import { rundeTilSgShots } from "@/lib/runde-logg/til-sg-shots";

/**
 * Hull-for-hull-detaljer fra det valgfrie logge-steget (D6a, 17. juli 2026).
 * Brutto tall per hull — putter/fairway/GIR er valgfrie (null = ikke logget,
 * aldri fabrikkert). Valideres med zod ved lagring (JSON-regelen).
 */
const hullDetaljSchema = z
  .object({
    nr: z.number().int().min(1).max(18),
    par: z.number().int().min(3).max(5),
    strokes: z.number().int().min(1).max(15),
    putts: z.number().int().min(0).max(10).nullable(),
    fairway: z.boolean().nullable(),
    gir: z.boolean().nullable(),
  })
  .refine((h) => h.putts == null || h.putts <= h.strokes, {
    message: "Putter kan ikke overstige antall slag",
  });

const hullDetaljListe = z
  .array(hullDetaljSchema)
  .refine((h) => h.length === 9 || h.length === 18, {
    message: "Hull-for-hull krever 9 eller 18 hull",
  })
  .refine((h) => new Set(h.map((x) => x.nr)).size === h.length, {
    message: "Duplikate hullnummer",
  });

export type HullDetaljInput = z.infer<typeof hullDetaljSchema>;

export type LogRoundManualInput = {
  courseId: string;
  playedAt: string;
  score: number;
  holeScores?: number[];
  /**
   * Valgfritt hull-for-hull-steg: par + slag + putter/FW/GIR per hull.
   * Har forrang over `holeScores` (legacy-feltet beholdes for bakoverkomp.).
   * Utelatt = «kun totalscore» — runden lagres uten HoleScore-rader.
   */
  hullDetaljer?: HullDetaljInput[];
  tee?: string;
  weather?: string[];
  spillType?: string;
  partners?: string[];
  fir?: { hits: number; of: number };
  gir?: { hits: number; of: number };
  putts?: number;
  sandSaves?: string;
  penalties?: number;
  notes?: string;
  tellHandicap?: boolean;
  // Strokes Gained — manuelt registrert, alle valgfrie.
  sgOtt?: number | null;
  sgApp?: number | null;
  sgArg?: number | null;
  sgPutt?: number | null;
};

/**
 * logRoundManual — registrerer en manuell runde (uten GolfBox-import).
 * Lager en Round-rad + HoleScore per hull i samme transaksjon — enten fra
 * det valgfrie hull-for-hull-steget (`hullDetaljer`: par/slag/putter/FW/GIR,
 * 9 eller 18 hull) eller fra legacy `holeScores` mot par-malen. Uten begge
 * lagres kun totalen («kun totalscore»-modus). HoleScore er det «Fullfør
 * kjeden» leter etter — uten den kan en hurtig-registrert runde aldri
 * tilbys full Strokes Gained i etterkant.
 */
export async function logRoundManual(input: LogRoundManualInput) {
  const user = await requireConsentingUser();

  const sgValues = [input.sgOtt, input.sgApp, input.sgArg, input.sgPutt];
  const sgTastet = sgValues.some((v) => typeof v === "number")
    ? sgValues.reduce<number>((sum, v) => sum + (v ?? 0), 0)
    : null;

  const course = await prisma.courseDefinition.findUnique({
    where: { id: input.courseId },
    select: { par: true },
  });
  if (!course) throw new Error("Banen finnes ikke");

  const pars = parTemplate(course.par);

  // Hull-for-hull-detaljer (D6a) har forrang; legacy `holeScores` (kun slag
  // mot par-malen) beholdes uendret som fallback for eldre kall.
  let holeScores: Array<{
    holeNumber: number;
    par: number;
    strokes: number;
    putts: number | null;
    fairway: boolean | null;
    gir: boolean | null;
  }>;
  if (input.hullDetaljer && input.hullDetaljer.length > 0) {
    const parsed = hullDetaljListe.safeParse(input.hullDetaljer);
    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? "Ugyldige hull-for-hull-data",
      );
    }
    holeScores = parsed.data.map((h) => ({
      holeNumber: h.nr,
      par: h.par,
      strokes: h.strokes,
      putts: h.putts,
      // Par 3 har ingen fairway — logges aldri der.
      fairway: h.par === 3 ? null : h.fairway,
      gir: h.gir,
    }));
  } else {
    holeScores = (input.holeScores ?? [])
      .slice(0, pars.length)
      .map((strokes, i) => ({
        holeNumber: i + 1,
        par: pars[i],
        strokes,
        putts: null,
        fairway: null,
        gir: null,
      }));
  }

  // Brutto totalscore: når hull-data finnes er summen av hullene sannheten.
  const score =
    holeScores.length > 0
      ? holeScores.reduce((sum, h) => sum + h.strokes, 0)
      : input.score;

  // «Bare totalen» (RU-04): ingen hull-detaljer, ingen legacy holeScores, og
  // ingen håndtastet SG — eneste vei til ET SG-tall er å fordele totalen over
  // en syntetisk 18-hulls kjede (samme motor som hurtigmodusen i live-føringen,
  // se estimer-fra-total.ts) og merke resultatet "estimert", ALDRI "beregnet".
  // Den syntetiske kjeden brukes KUN til å regne SG — ingen HoleScore-rader
  // skrives fra den (holeScores forblir tom, som før): per-hull strokes/putt
  // her er oppdiktet fordeling, ikke noe spilleren faktisk førte, og PH-12
  // (urørt av denne loopen) har ingen EST-merking å vise dem med.
  let sgEstimat: ReturnType<typeof beregnSg> | null = null;
  let granulaerEstimat: ReturnType<typeof beregnGranulaerSg> | null = null;
  if (holeScores.length === 0 && sgTastet == null) {
    try {
      const syntetiskHull = estimerHullFraTotal({
        score: input.score,
        putts: input.putts ?? null,
        coursePar: course.par,
      });
      const sgShots = rundeTilSgShots(syntetiskHull);
      sgEstimat = beregnSg(sgShots);
      granulaerEstimat = beregnGranulaerSg(syntetiskHull, sgShots);
    } catch {
      // Ugyldig input for syntetisering (f.eks. urealistisk score) — lagre
      // uten SG heller enn å kaste og miste hele registreringen.
      sgEstimat = null;
      granulaerEstimat = null;
    }
  }

  const sgTotal = sgTastet ?? sgEstimat?.total ?? null;
  const sgSource: "manual" | "estimert" | null =
    sgTastet != null ? "manual" : sgEstimat != null ? "estimert" : null;

  await prisma.$transaction(async (tx) => {
    const round = await tx.round.create({
      data: {
        userId: user.id,
        courseId: input.courseId,
        playedAt: new Date(input.playedAt),
        score,
        notes: input.notes ?? null,
        sgOtt: input.sgOtt ?? sgEstimat?.ott ?? null,
        sgApp: input.sgApp ?? sgEstimat?.app ?? null,
        sgArg: input.sgArg ?? sgEstimat?.arg ?? null,
        sgPutt: input.sgPutt ?? sgEstimat?.putt ?? null,
        sgTotal,
        sgTee: granulaerEstimat?.sgTee ?? null,
        sgApp200: granulaerEstimat?.sgApp200 ?? null,
        sgApp150: granulaerEstimat?.sgApp150 ?? null,
        sgApp100: granulaerEstimat?.sgApp100 ?? null,
        sgApp50: granulaerEstimat?.sgApp50 ?? null,
        sgChip: granulaerEstimat?.sgChip ?? null,
        sgPitch: granulaerEstimat?.sgPitch ?? null,
        sgBunker: granulaerEstimat?.sgBunker ?? null,
        sgPutt0_3: granulaerEstimat?.sgPutt0_3 ?? null,
        sgPutt3_5: granulaerEstimat?.sgPutt3_5 ?? null,
        sgPutt5_10: granulaerEstimat?.sgPutt5_10 ?? null,
        sgPutt10_15: granulaerEstimat?.sgPutt10_15 ?? null,
        sgPutt15_25: granulaerEstimat?.sgPutt15_25 ?? null,
        sgPutt25_40: granulaerEstimat?.sgPutt25_40 ?? null,
        sgPutt40plus: granulaerEstimat?.sgPutt40plus ?? null,
        // Håndtastet SG skal aldri overskrives av autoberegning (recomputeRoundSg).
        // Estimert (fra kun totalscore) overskrives derimot gjerne — se sg-skriving.ts.
        sgSource,
      },
      select: { id: true },
    });

    if (holeScores.length > 0) {
      await tx.holeScore.createMany({
        data: holeScores.map((h) => ({ ...h, roundId: round.id })),
      });
    }
  });

  // Bygg/behold broen til banegeometrien (AP0.4). Må stå FØR redirect —
  // redirect() kaster NEXT_REDIRECT. Kaster aldri selv.
  await sikreBaneBro(input.courseId);

  // SG-broen (T6): oppdater DataGolf-grunnlaget (BrukerSgInput, kilde
  // PLAYERHQ) fra runde-SG. Best-effort — kaster aldri, og må stå FØR
  // redirect (redirect kaster). Uten SG på runden er den en no-op.
  await synkroniserSgFraRunder(user.id);

  revalidatePath("/portal/mal/runder");
  redirect("/portal/mal/runder");
}
