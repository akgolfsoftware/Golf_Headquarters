import { z } from "zod";

import kilder from "./sesongevaluering-kilder.json";
import { IUP_VERSJONER, type IupVersjon } from "./utviklingssjekk";

/** Årsevalueringen har en annen skala enn utviklingssjekken. */
export const SESONGEVALUERING_SKALA = { min: 1, maks: 4 } as const;
export const IUP_FORDELINGSOMRAADER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

export function hentSesongsporsmal(versjon: IupVersjon) {
  return kilder[versjon].sporsmal.map((s) => ({ ...s }));
}

export function hentSesongevalueringKilde(versjon: IupVersjon) {
  const kilde = kilder[versjon];
  return { filnavn: kilde.filnavn, sha256: kilde.sha256, ark: kilde.ark, skala: { ...kilde.skala } };
}

const Prosentfordeling = z.record(z.string(), z.number().min(0).max(100));
const SesongevalueringSchema = z.object({
  versjon: z.enum(IUP_VERSJONER),
  // Valgt periode lagres eksplisitt. Årstallet i originalteksten er kildehistorikk,
  // ikke en låst datoperiode eller et implisitt inneværende kalenderår.
  sesongStart: z.iso.date(),
  sesongSlutt: z.iso.date(),
  status: z.enum(["UTKAST", "LEVERT"]),
  fritekst: z.record(z.string().min(1).max(80), z.string().trim().max(10000)),
  vurderinger: z.record(z.string().min(1).max(80), z.number().int().min(1).max(4)),
  fordelingFaktisk: Prosentfordeling,
  fordelingPlanlagt: Prosentfordeling,
  forbedringspunkter: z.array(z.string().trim().max(2000)).max(20),
}).strict();

export type IupSesongevaluering = z.infer<typeof SesongevalueringSchema>;
export type SesongevalueringResultat =
  | { ok: true; data: IupSesongevaluering; mangler: string[] }
  | { ok: false; kode: "UGYLDIG_FORMAT" | "UGYLDIG_PERIODE" | "UKJENT_FELT" | "UFULLSTENDIG"; melding: string };

/** Ren validering; lagring og autorisasjon må utføres separat på serveren. */
export function lesSesongevaluering(input: unknown): SesongevalueringResultat {
  const parsed = SesongevalueringSchema.safeParse(input);
  if (!parsed.success) return { ok: false, kode: "UGYLDIG_FORMAT", melding: "Kontroller kildeår, datoer, fritekst, vurderinger 1–4 og prosenter 0–100." };
  const data = parsed.data;
  if (data.sesongStart > data.sesongSlutt) {
    return { ok: false, kode: "UGYLDIG_PERIODE", melding: "Sesongslutt kan ikke komme før sesongstart." };
  }

  const sporsmal = hentSesongsporsmal(data.versjon);
  const fritekst = sporsmal.filter((s) => s.type === "FRITEKST");
  const vurderinger = sporsmal.filter((s) => s.type === "SKALA");
  const kjenteTekster = new Set(fritekst.map((s) => s.id));
  const kjenteVurderinger = new Set(vurderinger.map((s) => s.id));
  const kjenteOmraader = new Set<string>(IUP_FORDELINGSOMRAADER);
  if (Object.keys(data.fritekst).some((id) => !kjenteTekster.has(id))
    || Object.keys(data.vurderinger).some((id) => !kjenteVurderinger.has(id))
    || [data.fordelingFaktisk, data.fordelingPlanlagt].some((f) => Object.keys(f).some((id) => !kjenteOmraader.has(id)))) {
    return { ok: false, kode: "UKJENT_FELT", melding: "Et felt tilhører feil kildeår, spørsmålstype eller pyramideområde." };
  }

  const mangler: string[] = [
    ...fritekst.filter((s) => !data.fritekst[s.id]).map((s) => s.id),
    ...vurderinger.filter((s) => !Object.hasOwn(data.vurderinger, s.id)).map((s) => s.id),
  ];
  for (const navn of ["fordelingFaktisk", "fordelingPlanlagt"] as const) {
    const fordeling = data[navn];
    for (const omraade of IUP_FORDELINGSOMRAADER) {
      if (!Object.hasOwn(fordeling, omraade)) mangler.push(`${navn}.${omraade}`);
    }
    // Flyttall kan avvike ørlite ved summering. Verken 99,9 eller 100,1 er 100.
    if (Math.abs(Object.values(fordeling).reduce((sum, n) => sum + n, 0) - 100) > 1e-9) {
      mangler.push(`${navn}.sum100`);
    }
  }
  if (data.forbedringspunkter.filter(Boolean).length < 3) mangler.push("forbedringspunkter.min3");
  if (data.status === "LEVERT" && mangler.length) {
    return { ok: false, kode: "UFULLSTENDIG", melding: "Besvar alle 13 spørsmål, fordel 100 prosent i begge perioder og oppgi minst tre forbedringspunkter før levering." };
  }
  return { ok: true, data, mangler };
}
