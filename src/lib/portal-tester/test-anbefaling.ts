import { z } from "zod";
import { OMRAADE_KODER } from "@/lib/domain/ak-formel-v2";
import { tnComparableResult } from "./tn-integration";

const kategori = z.enum(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]);
const omraadeSchema = z.enum(OMRAADE_KODER);
const godkjentOvelseSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["DRILL", "OVELSE"]),
  navn: z.string().min(1),
  beskrivelse: z.string().min(1),
  status: z.literal("GODKJENT"),
  minKategori: kategori,
  maxKategori: kategori,
  environment: z.array(z.string().min(1)).min(1),
  fasilitetKrav: z.array(z.string().min(1)),
  akFormel: z.object({
    pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]),
    omraade: omraadeSchema,
  }),
  facilityRequirements: z.object({
    longestShotM: z.number().nonnegative(),
    longestShotKind: z.string().min(1),
  }),
});

export type GodkjentTestOvelse = z.infer<typeof godkjentOvelseSchema>;
export type Treningsfasilitet = {
  capabilities: readonly string[];
  maksPuttLengdeM: number | null;
  rangeLengdeM: number | null;
};

export type TestAnbefaling = {
  ovelse: GodkjentTestOvelse;
  kanLeggesTil: boolean;
  begrunnelse: string;
};

const ALLE_KATEGORIER = "ABCDEFGHIJK";

/** Kun eksplisitt områdekode eller en verifiserbar Team Norway-protokoll gir match. */
export function testOmraader(test: { id: string; omraade: string | null }): string[] {
  const omraade = omraadeSchema.safeParse(test.omraade);
  if (omraade.success) return [omraade.data];
  // 1–3 m tilsvarer omtrent 3,3–9,8 fot. Begge båndene er relevante, ikke en diagnose.
  if (test.id === "tn-v3-putt-1-3m") return ["PUTT_3_5", "PUTT_5_10"];
  return [];
}

function kategoriPasser(ovelse: GodkjentTestOvelse, spillerKategori: string | null): boolean {
  const fra = ALLE_KATEGORIER.indexOf(ovelse.minKategori);
  const til = ALLE_KATEGORIER.indexOf(ovelse.maxKategori);
  if (fra < 0 || til < 0) return false;
  const lav = Math.min(fra, til);
  const hoy = Math.max(fra, til);
  if (spillerKategori === null) return lav === 0 && hoy === 10;
  const aktuell = ALLE_KATEGORIER.indexOf(spillerKategori);
  return aktuell >= lav && aktuell <= hoy;
}

function fasilitetPasser(ovelse: GodkjentTestOvelse, fasilitet: Treningsfasilitet): boolean {
  if (!ovelse.fasilitetKrav.every((krav) => fasilitet.capabilities.includes(krav))) return false;
  const lengde = ovelse.facilityRequirements.longestShotM;
  if (ovelse.facilityRequirements.longestShotKind === "PUTT_ROLL") {
    return fasilitet.maksPuttLengdeM !== null && fasilitet.maksPuttLengdeM >= lengde;
  }
  if (lengde > 0) return fasilitet.rangeLengdeM !== null && fasilitet.rangeLengdeM >= lengde;
  return true;
}

export function foreslaGodkjenteOvelser(input: {
  test: { id: string; omraade: string | null };
  bank: readonly unknown[];
  fasiliteter: readonly Treningsfasilitet[];
  spillerKategori: string | null;
  environment?: string | null;
}): TestAnbefaling[] {
  const omraader = new Set(testOmraader(input.test));
  if (omraader.size === 0) return [];
  const ut: TestAnbefaling[] = [];
  for (const raw of input.bank) {
    const parsed = godkjentOvelseSchema.safeParse(raw);
    if (!parsed.success || !omraader.has(parsed.data.akFormel.omraade)) continue;
    const ovelse = parsed.data;
    if (!kategoriPasser(ovelse, input.spillerKategori)) continue;
    const miljoPasser = !input.environment || ovelse.environment.includes(input.environment);
    const fasilitetFinnes = input.fasiliteter.some((f) => fasilitetPasser(ovelse, f));
    ut.push({
      ovelse,
      kanLeggesTil: miljoPasser && fasilitetFinnes,
      begrunnelse: !miljoPasser
        ? "Øvelsen passer ikke valgt treningssted."
        : fasilitetFinnes
          ? "Godkjent øvelse i samme treningsområde. Coach vurderer om den passer resultatet."
          : "Fasilitet og nødvendig lengde er ikke bekreftet for spilleren.",
    });
  }
  return ut;
}

export type TestTrend = "HOYERE" | "LAVERE" | "LIKT" | "IKKE_SAMMENLIGNBAR";

/** Beskriv bare retningen. Nivåvarsel krever en egen godkjent norm og terskel. */
export function sammenlignMedForrige(
  ny: { id: string; testId: string; score: number; details: unknown; takenAt: Date },
  historikk: readonly { id: string; testId: string; score: number; details: unknown; takenAt: Date }[],
): TestTrend {
  const basis = tnComparableResult(ny.testId, ny.score, ny.details);
  if (!basis) return "IKKE_SAMMENLIGNBAR";
  const forrige = historikk
    .filter((r) => r.id !== ny.id && r.takenAt < ny.takenAt)
    .map((r) => ({ rad: r, sammenlignbar: tnComparableResult(r.testId, r.score, r.details) }))
    .filter((r) => r.sammenlignbar?.comparisonKey === basis.comparisonKey)
    .sort((a, b) => b.rad.takenAt.getTime() - a.rad.takenAt.getTime())[0];
  if (!forrige) return "IKKE_SAMMENLIGNBAR";
  if (ny.score === forrige.rad.score) return "LIKT";
  return ny.score > forrige.rad.score ? "HOYERE" : "LAVERE";
}

export function ovelsesNavn(navn: string): string {
  const tekst = navn.replace(/[-_]+/g, " ").trim();
  return tekst.charAt(0).toLocaleUpperCase("nb-NO") + tekst.slice(1);
}
