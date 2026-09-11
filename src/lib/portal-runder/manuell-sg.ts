import { z } from "zod";

/** Samme felt og intervaller som Round og granulaer-sg.ts. Ingen ny SG-modell. */
export const SG_HOVEDFELT = [
  { key: "sgTotal", label: "SG totalt" },
  { key: "sgOtt", label: "Utslag (OTT)" },
  { key: "sgApp", label: "Innspill (APP)" },
  { key: "sgArg", label: "Nærspill (ARG)" },
  { key: "sgPutt", label: "Putting" },
] as const;

export const SG_DETALJGRUPPER = [
  {
    label: "Tee og innspill",
    fields: [
      { key: "sgTee", label: "Alle tee-slag" },
      { key: "sgApp50", label: "Innspill til og med 75 m" },
      { key: "sgApp100", label: "Innspill over 75–125 m" },
      { key: "sgApp150", label: "Innspill over 125–175 m" },
      { key: "sgApp200", label: "Innspill over 175 m" },
    ],
  },
  {
    label: "Nærspill",
    fields: [
      { key: "sgChip", label: "Chip (til og med 12 m)" },
      { key: "sgPitch", label: "Pitch" },
      { key: "sgLob", label: "Lob" },
      { key: "sgBunker", label: "Bunker" },
    ],
  },
  {
    label: "Putting — avstand i fot (ft)",
    fields: [
      { key: "sgPutt0_3", label: "Putting til og med 3 ft" },
      { key: "sgPutt3_5", label: "Putting over 3–5 ft" },
      { key: "sgPutt5_10", label: "Putting over 5–10 ft" },
      { key: "sgPutt10_15", label: "Putting over 10–15 ft" },
      { key: "sgPutt15_25", label: "Putting over 15–25 ft" },
      { key: "sgPutt25_40", label: "Putting over 25–40 ft" },
      { key: "sgPutt40plus", label: "Putting over 40 ft" },
    ],
  },
] as const;

export type SgDetaljFelt = (typeof SG_DETALJGRUPPER)[number]["fields"][number];
export const SG_DETALJFELT: readonly SgDetaljFelt[] = SG_DETALJGRUPPER.flatMap(
  (g) => g.fields as readonly SgDetaljFelt[],
);
export type ManuellSgFelt = (typeof SG_HOVEDFELT)[number]["key"] | SgDetaljFelt["key"];
export const SG_ALLE_FELT: readonly { key: ManuellSgFelt; label: string }[] = [
  ...SG_HOVEDFELT, ...SG_DETALJFELT,
];
export type ManuellSgVerdier = Record<ManuellSgFelt, number | null>;
export type ManuellSgInput = Partial<ManuellSgVerdier>;
export type ManuellSgKladd = Record<ManuellSgFelt, string>;
export type ManuellSgFeil = Partial<Record<ManuellSgFelt, string>>;
export type ManuellSgResultat =
  | { ok: true; verdier: ManuellSgVerdier; harTall: boolean; beregnetTotal: number | null }
  | { ok: false; feil: ManuellSgFeil; melding: string };

const tall = z.number().finite().min(-100).max(100).nullable().optional();
export const manuellSgSchema = z.object({
  sgTotal: tall, sgOtt: tall, sgApp: tall, sgArg: tall, sgPutt: tall,
  sgTee: tall, sgApp50: tall, sgApp100: tall, sgApp150: tall, sgApp200: tall,
  sgChip: tall, sgPitch: tall, sgLob: tall, sgBunker: tall,
  sgPutt0_3: tall, sgPutt3_5: tall, sgPutt5_10: tall, sgPutt10_15: tall,
  sgPutt15_25: tall, sgPutt25_40: tall, sgPutt40plus: tall,
}).strict();

export function sgKladdFraVerdier(verdier: ManuellSgInput = {}): ManuellSgKladd {
  return Object.fromEntries(SG_ALLE_FELT.map(({ key }) => [
    key, verdier[key] == null ? "" : String(verdier[key]).replace(".", ","),
  ])) as ManuellSgKladd;
}

export function hentManuelleSgFelt(input: ManuellSgInput): ManuellSgInput {
  return Object.fromEntries(SG_ALLE_FELT.map(({ key }) => [key, input[key]]));
}

/** Detaljfeltene kan overlappe (tee/OTT, pitch/lob). Summer aldri disse til en hovedkategori. */
export function validerManuellSg(input: unknown): ManuellSgResultat {
  const parsed = manuellSgSchema.safeParse(input);
  if (!parsed.success) {
    const feil: ManuellSgFeil = {};
    for (const issue of parsed.error.issues) {
      const felt = SG_ALLE_FELT.find((f) => f.key === issue.path[0]);
      if (felt) feil[felt.key] = `${felt.label}: bruk et tall mellom −100 og +100.`;
    }
    return { ok: false, feil, melding: Object.values(feil)[0] ?? "Ugyldige SG-felt." };
  }
  const verdier = Object.fromEntries(SG_ALLE_FELT.map(({ key }) => [key, parsed.data[key] ?? null])) as ManuellSgVerdier;
  const hoved = [verdier.sgOtt, verdier.sgApp, verdier.sgArg, verdier.sgPutt];
  const beregnetTotal = hoved.every((v) => v != null)
    ? Number(hoved.reduce<number>((sum, v) => sum + (v ?? 0), 0).toFixed(6))
    : null;
  if (beregnetTotal != null && (Math.abs(beregnetTotal) > 100 ||
    (verdier.sgTotal != null && Math.abs(verdier.sgTotal - beregnetTotal) > 0.030001))) {
    const melding = "SG totalt må stemme med summen av de fire hovedkategoriene (inntil 0,03 i avrundingsforskjell).";
    return { ok: false, feil: { sgTotal: melding }, melding };
  }
  // En delvis registrering har ukjent total, ikke summen av de kjente feltene.
  verdier.sgTotal ??= beregnetTotal;
  return { ok: true, verdier, beregnetTotal, harTall: SG_ALLE_FELT.some(({ key }) => verdier[key] != null) };
}

/** Godtar norsk komma og Unicode-minus, men lar aldri ugyldig tekst bli «ukjent». */
export function lesManuellSgKladd(kladd: ManuellSgKladd): ManuellSgResultat {
  const verdier: ManuellSgInput = {};
  const feil: ManuellSgFeil = {};
  for (const { key, label } of SG_ALLE_FELT) {
    const tekst = kladd[key].trim().replaceAll("−", "-");
    if (!tekst) { verdier[key] = null; continue; }
    if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(tekst)) {
      feil[key] = `${label}: skriv et tall, for eksempel −0,25.`;
      continue;
    }
    verdier[key] = Number(tekst.replace(",", "."));
  }
  if (Object.keys(feil).length > 0) return { ok: false, feil, melding: Object.values(feil)[0]! };
  return validerManuellSg(verdier);
}

export function byttSgFortegn(tekst: string): string {
  const t = tekst.trim().replaceAll("−", "-");
  if (!t) return "-";
  return t.startsWith("-") ? t.slice(1) : `-${t.replace(/^\+/, "")}`;
}
