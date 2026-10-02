import { z } from "zod";

// Eget omfang: et gammelt gruppesamtykke blir aldri personlig fullprofil-deling.
export const NAVNGITT_PROFIL_SCOPE = "NAVNGITT_KOMPLETT_PROFIL";
export const NAVNGITT_PROFIL_TEKST_VERSJON = "2026-10-02";
export const NAVNGITT_PROFIL_TEKST = {
  tittel: "Del profilen med treneren din",
  forklaring: "Du deler hele PlayerHQ-profilen din med denne navngitte treneren, også helseopplysninger og meldinger. Treneren kan lese IUP, mål, treningsplan, tester, statistikk, TrackMan, samtaler og turneringsresultater. Trenerens forslag endrer først planen din når du godkjenner dem.",
  punkter: [
    "Delingen gjelder bare treneren og miljøet du velger her.",
    "Treneren må logge inn med den angitte e-postadressen og være tilknyttet miljøet. Lenken utløper etter sju dager.",
    "Er spilleren under 16 år, må en foresatt godkjenne delingen.",
    "Du kan trekke tilgangen når som helst. Nye oppslag stoppes straks; opplysninger og trening som er ført, blir hos spilleren.",
  ],
};
export function trenerEpostDomene(epost: string): "WANG" | "TEAM_NORWAY" | null {
  const lest = z.email().safeParse(epost.trim().toLowerCase());
  if (!lest.success) return null;
  const domene = lest.data.split("@")[1];
  return domene === "wang.no" ? "WANG" : domene === "golfforbundet.no" ? "TEAM_NORWAY" : null;
}
const id = z.string().min(1).max(120);
export const NyTrenerInvitasjonSchema = z.object({
  requestId: z.uuid().transform((v) => v.toLowerCase()),
  spillerId: id, gruppeId: id,
  epost: z.email().max(254).transform((v) => v.toLowerCase()).refine((v) => trenerEpostDomene(v) !== null),
  tekstVersjon: z.literal(NAVNGITT_PROFIL_TEKST_VERSJON),
  godkjent: z.literal(true),
}).strict();
export const AksepterTrenerInvitasjonSchema = z.object({ token: z.string().regex(/^[0-9a-f]{64}$/) }).strict();
export const TrekkTrenerDelingSchema = z.object({ invitasjonId: z.uuid(), spillerId: id }).strict();

export type NavngittSamtykkeRad = {
  id: string; scope: string; mottakerGruppeId: string; mottakerUserId: string | null;
  gitt: boolean; gittAvRolle: string; gittAvUserId: string; tekstVersjon: string; createdAt: Date;
};
/** En tilbaketrekking gjelder også når den mindreårige trekker selv. Lik tid stenger. */
export function gjeldendeNavngittSamtykke(rader: readonly NavngittSamtykkeRad[], krav: {
  gruppeId: string; trenerId: string; spillerId: string; kreverForesatt: boolean; foresattIder: readonly string[];
}): NavngittSamtykkeRad | null {
  const aktuelle = rader.filter((r) => r.scope === NAVNGITT_PROFIL_SCOPE && r.mottakerGruppeId === krav.gruppeId && r.mottakerUserId === krav.trenerId);
  const nyesteTid = Math.max(...aktuelle.map((r) => r.createdAt.getTime()));
  const nyeste = aktuelle.filter((r) => r.createdAt.getTime() === nyesteTid);
  // To motstridende hendelser i samme millisekund skal aldri åpne data.
  if (nyeste.length !== 1) return null;
  const rad = nyeste[0];
  if (!rad.gitt || rad.tekstVersjon !== NAVNGITT_PROFIL_TEKST_VERSJON) return null;
  if (rad.gittAvRolle === "SELV") return !krav.kreverForesatt && rad.gittAvUserId === krav.spillerId ? rad : null;
  if (rad.gittAvRolle === "FORESATT") return krav.foresattIder.includes(rad.gittAvUserId) ? rad : null;
  return null;
}
