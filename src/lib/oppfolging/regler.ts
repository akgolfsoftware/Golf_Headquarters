import { z } from "zod";

/**
 * Regler for fireukerssjekk, trenerforslag og samtale (Pakke 1, WANG-43/44/45/46
 * og TN-01/02). Delt mellom WANG og Team Norway; `flate` skiller dem.
 * Ren logikk uten database, låst av regler.test.ts.
 */

export const FLATER = ["WANG", "TEAM_NORWAY"] as const;
export type Flate = (typeof FLATER)[number];

export const FORSLAG_TYPER = ["PLAN", "IUP", "SAMTALE", "VURDERING"] as const;
export type ForslagType = (typeof FORSLAG_TYPER)[number];
export const FORSLAG_TYPE_NAVN: Record<ForslagType, string> = {
  PLAN: "Plan",
  IUP: "IUP",
  SAMTALE: "Samtale",
  VURDERING: "Vurdering",
};

export const FORSLAG_STATUSER = ["VENTER", "GODTATT", "AVVIST"] as const;
export type ForslagStatus = (typeof FORSLAG_STATUSER)[number];
export const FORSLAG_STATUS_NAVN: Record<ForslagStatus, string> = {
  VENTER: "Venter",
  GODTATT: "Godtatt",
  AVVIST: "Avvist",
};

export const SAMTALE_TYPER = ["FIREUKERSSJEKK", "OPPFOLGING", "ANNET"] as const;
export type SamtaleType = (typeof SAMTALE_TYPER)[number];
export const SAMTALE_TYPE_NAVN: Record<SamtaleType, string> = {
  FIREUKERSSJEKK: "Fireukerssjekk",
  OPPFOLGING: "Oppfølging",
  ANNET: "Annet",
};

/** Team Norways utviklingssjekk har åtte spørsmål; hvert besvares 1–4 på elevens nivå. */
export const UTVIKLINGSSJEKK_ANTALL = 8;
export const UTVIKLINGSSJEKK_NIVAER = ["UNG", "JUNIOR", "AMATOR", "PROFESJONELL"] as const;

const spm = z.enum(["1", "2", "3", "4", "5", "6", "7", "8"]);
export const UtviklingssjekkSchema = z.object({
  niva: z.enum(UTVIKLINGSSJEKK_NIVAER),
  svar: z.record(spm, z.number().int().min(1).max(4)),
});
export type Utviklingssjekk = z.infer<typeof UtviklingssjekkSchema>;

/** JSON-blob fra basen. Ugyldig eller manglende blir null, aldri en gjettet verdi. */
export function lesUtviklingssjekk(rå: unknown): Utviklingssjekk | null {
  const r = UtviklingssjekkSchema.safeParse(rå);
  return r.success ? r.data : null;
}

export const ForslagInput = z.object({
  elevId: z.string().trim().min(1).max(64),
  type: z.enum(FORSLAG_TYPER),
  tekst: z.string().trim().min(1, "Forslaget kan ikke være tomt").max(1000, "Forslaget er for langt (maks 1000 tegn)"),
});
export type ForslagInputT = z.infer<typeof ForslagInput>;

/** Dato som «YYYY-MM-DD» (Oslo-dag). Parses med Date.UTC, aldri new Date(y, m-1, d). */
export const DagTekst = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dato må være ÅÅÅÅ-MM-DD");

export function dagTilDato(dag: string): Date | null {
  if (!DagTekst.safeParse(dag).success) return null;
  const [a, m, d] = dag.split("-").map(Number);
  const dato = new Date(Date.UTC(a, m - 1, d));
  return dato.getUTCFullYear() === a && dato.getUTCMonth() === m - 1 && dato.getUTCDate() === d ? dato : null;
}

export const SamtaleInput = z.object({
  elevId: z.string().trim().min(1).max(64),
  dag: DagTekst,
  type: z.enum(SAMTALE_TYPER),
  avtalt: z.string().trim().min(1, "Skriv hva dere avtalte").max(2000, "Referatet er for langt (maks 2000 tegn)"),
  fireukerssjekkId: z.string().trim().min(1).max(64).nullish(),
});
export type SamtaleInputT = z.infer<typeof SamtaleInput>;

/** Bare VENTER kan få svar, og bare til GODTATT eller AVVIST. Ingen vei tilbake. */
export function kanSvare(fra: ForslagStatus, til: ForslagStatus): boolean {
  return fra === "VENTER" && (til === "GODTATT" || til === "AVVIST");
}

export type SjekkStatus = "LEVERT" | "FORFALT" | "PAAGAAR";

/** Levert = levertAt satt. Forfalt = fristen er passert uten innlevering. Ellers pågår den. */
export function sjekkStatus(s: { levertAt: Date | null; frist: Date }, naa: Date): SjekkStatus {
  if (s.levertAt !== null) return "LEVERT";
  return s.frist.getTime() < naa.getTime() ? "FORFALT" : "PAAGAAR";
}

/** Bare trenere. Elev, foresatt og alt annet nektes. */
export function erTrenerRolle(gruppeRolle: string | null | undefined): boolean {
  return gruppeRolle === "COACH" || gruppeRolle === "ASSISTANT";
}

/** Tilstanden skjemaene viser etter en handling. null = ikke sendt ennå. */
export type SkjemaTilstand = { ok: boolean; melding: string } | null;

function tekstFelt(fd: FormData, navn: string): string {
  const v = fd.get(navn);
  return typeof v === "string" ? v : "";
}

export function lesForslagSkjema(fd: FormData) {
  return { elevId: tekstFelt(fd, "elevId"), type: tekstFelt(fd, "type"), tekst: tekstFelt(fd, "tekst") };
}

export function lesSamtaleSkjema(fd: FormData) {
  const kobling = tekstFelt(fd, "fireukerssjekkId");
  return {
    elevId: tekstFelt(fd, "elevId"),
    dag: tekstFelt(fd, "dag"),
    type: tekstFelt(fd, "type"),
    avtalt: tekstFelt(fd, "avtalt"),
    fireukerssjekkId: kobling === "" ? null : kobling,
  };
}

const osloDagFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" });

/** «YYYY-MM-DD» for Oslo-dagen til et tidspunkt (Vercel kjører UTC, appen tenker Oslo). */
export function osloDagIso(t: Date): string {
  return osloDagFormat.format(t);
}
