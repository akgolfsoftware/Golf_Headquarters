import { z } from "zod";

import kilder from "./utviklingssjekk-kilder.json";

/** Spørsmål fra originalarkene. Inneholder aldri utfylte svar eller kontaktinfo. */
export const IUP_VERSJONER = ["iup-2025", "iup-2027"] as const;
export const IUP_NIVAAER = ["UNG", "JUNIOR", "AMATOR", "PROFESJONELL"] as const;
export type IupVersjon = (typeof IUP_VERSJONER)[number];
export type IupNivaa = (typeof IUP_NIVAAER)[number];

export const IUP_KATEGORIER = [
  "Sosial", "Mentalt", "Fysisk", "Strategisk", "Teknisk", "Golfutvikling", "Neste trinn",
] as const;

export const UTVIKLINGSSJEKK_SKALA = [
  { verdi: 1, tekst: "Ikke i det hele tatt oppfylt" },
  { verdi: 2, tekst: "Delvis oppfylt" },
  { verdi: 3, tekst: "Moderat oppfylt" },
  { verdi: 4, tekst: "Nesten helt oppfylt" },
  { verdi: 5, tekst: "Helt oppfylt" },
] as const;

export type IupSporsmal = {
  id: string;
  celle: string;
  kategori: string;
  tekst: string;
};

/** Ingen implisitt versjon: et nytt kildeår skal aldri endre gamle svar. */
export function hentUtviklingssporsmal(versjon: IupVersjon, niva: IupNivaa): ReadonlyArray<IupSporsmal> {
  return kilder[versjon].nivaaer[niva].map((sporsmal) => ({ ...sporsmal }));
}

export function hentIupKilde(versjon: IupVersjon) {
  const kilde = kilder[versjon];
  return { filnavn: kilde.filnavn, sha256: kilde.sha256, ark: kilde.ark, skala: { ...kilde.skala } };
}

const BesvarelseSchema = z.object({
  versjon: z.enum(IUP_VERSJONER),
  niva: z.enum(IUP_NIVAAER),
  status: z.enum(["UTKAST", "LEVERT"]),
  svar: z.record(z.string().min(1).max(80), z.number().int().min(1).max(5)),
  // Fireukerssjekk (PH-IUP-01, 04.10.2026): prosessmål per Goal-ID og valgfritt notat til trenerne.
  prosessmal: z.record(z.string().min(1).max(120), z.enum(["JA", "DELVIS", "NEI"])).optional(),
  notat: z.string().max(2000).optional(),
}).strict();

export type IupBesvarelse = z.infer<typeof BesvarelseSchema>;
export type IupLeseresultat =
  | { ok: true; data: IupBesvarelse; besvart: number; totalt: number; mangler: string[] }
  | { ok: false; kode: "UGYLDIG_FORMAT" | "UKJENT_SPORSMAL" | "UFULLSTENDIG"; melding: string };

/**
 * Felles inngangsregel for spillerføring og begge trenernes lesere.
 * Eldre åttespørsmålssvar omskrives ikke til et fullført IUP-svar.
 * Autorisasjon og lagring tilhører serverlaget, ikke denne rene kildekontrakten.
 */
export function lesIupBesvarelse(input: unknown): IupLeseresultat {
  const parsed = BesvarelseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, kode: "UGYLDIG_FORMAT", melding: "Besvarelsen må ha kjent kildeversjon, nivå og hele tall fra 1 til 5." };
  }
  const data = parsed.data;
  const sporsmal = hentUtviklingssporsmal(data.versjon, data.niva);
  const gyldige = new Set(sporsmal.map((s) => s.id));
  const nøkler = Object.keys(data.svar);
  if (nøkler.some((id) => !gyldige.has(id))) {
    return { ok: false, kode: "UKJENT_SPORSMAL", melding: "Et svar tilhører et annet spørsmål, nivå eller kildeår." };
  }
  const mangler = sporsmal.filter((s) => !Object.hasOwn(data.svar, s.id)).map((s) => s.id);
  if (data.status === "LEVERT" && mangler.length > 0) {
    return { ok: false, kode: "UFULLSTENDIG", melding: `Besvar alle ${sporsmal.length} spørsmål før du leverer.` };
  }
  return { ok: true, data, besvart: nøkler.length, totalt: sporsmal.length, mangler };
}

/** Historikk kan ikke sammenlignes ved å anta at radnummer betyr samme spørsmål. */
export function sammenlignIupBesvarelser(forrige: unknown, neste: unknown):
  | { sammenlignbar: true; endringer: Array<{ sporsmalId: string; fra: number; til: number }> }
  | { sammenlignbar: false; grunn: "UGYLDIG" | "UTKAST" | "ULIK_VERSJON_ELLER_NIVAA" } {
  const a = lesIupBesvarelse(forrige);
  const b = lesIupBesvarelse(neste);
  if (!a.ok || !b.ok) return { sammenlignbar: false, grunn: "UGYLDIG" };
  if (a.data.status !== "LEVERT" || b.data.status !== "LEVERT") {
    return { sammenlignbar: false, grunn: "UTKAST" };
  }
  if (a.data.versjon !== b.data.versjon || a.data.niva !== b.data.niva) {
    return { sammenlignbar: false, grunn: "ULIK_VERSJON_ELLER_NIVAA" };
  }
  return {
    sammenlignbar: true,
    endringer: hentUtviklingssporsmal(a.data.versjon, a.data.niva).map((s) => ({
      sporsmalId: s.id, fra: a.data.svar[s.id], til: b.data.svar[s.id],
    })).filter((rad) => rad.fra !== rad.til),
  };
}
