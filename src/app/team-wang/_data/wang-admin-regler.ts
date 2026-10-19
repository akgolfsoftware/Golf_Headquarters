// Rene regler for WANG Administrasjon (pakke W4): invitasjonslenke for trener og unntak i timeplanen.
// Ingen DB, testbart uten Prisma.

import { createHash, randomBytes } from "node:crypto";
import { MAKS_TEGN_UNNTAK } from "./wang-admin-grenser";

export { MAKS_TEGN_UNNTAK };

/** Invitasjonslenken gjelder i sju dager, som delingslenken (beslutninger 28.09.2026). */
export const WANG_INVITASJON_DAGER = 7;

export function lagInvitasjonToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Bare hashen lagres. Rå token står bare i lenken, som vises én gang. */
export function hashInvitasjonToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function invitasjonUtloper(fra: Date = new Date()): Date {
  return new Date(fra.getTime() + WANG_INVITASJON_DAGER * 86_400_000);
}

export function invitasjonSti(token: string): string {
  return `/team-wang/coach/invitasjon/${token}`;
}

/** Rå token fra adressen: base64url, 43 tegn. Alt annet avvises før oppslag. */
export function erGyldigTokenForm(token: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}

export function normaliserEpost(verdi: unknown): string | null {
  if (typeof verdi !== "string") return null;
  const e = verdi.trim().toLowerCase();
  if (e.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null;
  return e;
}

export type InvitasjonStatus = "VENTER" | "BRUKT" | "TRUKKET" | "UTLOPT";

export function invitasjonStatus(
  inv: { acceptedAt: Date | null; revokedAt: Date | null; expiresAt: Date },
  naa: Date = new Date(),
): InvitasjonStatus {
  if (inv.acceptedAt) return "BRUKT";
  if (inv.revokedAt) return "TRUKKET";
  if (inv.expiresAt.getTime() <= naa.getTime()) return "UTLOPT";
  return "VENTER";
}

/** «YYYY-MM-DD» til en dato i UTC-midnatt (gotchas §Tid og datoer). */
export function lesDagStreng(verdi: unknown): Date | null {
  if (typeof verdi !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(verdi.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dato = new Date(Date.UTC(y, mo - 1, d));
  if (dato.getUTCFullYear() !== y || dato.getUTCMonth() !== mo - 1 || dato.getUTCDate() !== d) return null;
  return dato;
}

export type UnntakInput =
  | { ok: true; fraDato: Date; tilDato: Date | null; tekst: string }
  | { ok: false; feil: string };

export function lesUnntak(input: { fra: unknown; til: unknown; tekst: unknown }): UnntakInput {
  const fraDato = lesDagStreng(input.fra);
  if (!fraDato) return { ok: false, feil: "Velg en gyldig fra-dato." };
  const tilRaa = typeof input.til === "string" ? input.til.trim() : "";
  const tilDato = tilRaa ? lesDagStreng(tilRaa) : null;
  if (tilRaa && !tilDato) return { ok: false, feil: "Velg en gyldig til-dato." };
  if (tilDato && tilDato.getTime() < fraDato.getTime()) return { ok: false, feil: "Til-datoen kan ikke være før fra-datoen." };
  const tekst = typeof input.tekst === "string" ? input.tekst.replace(/\s+/g, " ").trim() : "";
  if (!tekst) return { ok: false, feil: "Skriv hva unntaket gjelder." };
  if (tekst.length > MAKS_TEGN_UNNTAK) return { ok: false, feil: `Høyst ${MAKS_TEGN_UNNTAK} tegn.` };
  return { ok: true, fraDato, tilDato: tilDato && tilDato.getTime() === fraDato.getTime() ? null : tilDato, tekst };
}

/** «HH:MM» (00:00–23:59) til minutter etter midnatt. Alt annet gir null. */
export function lesKlokke(verdi: unknown): number | null {
  if (typeof verdi !== "string") return null;
  const m = /^(\d{2}):(\d{2})$/.exec(verdi.trim());
  if (!m) return null;
  const [t, min] = [Number(m[1]), Number(m[2])];
  return t <= 23 && min <= 59 ? t * 60 + min : null;
}

export type FlyttInput =
  | { ok: true; ukedag: number; start: string; slutt: string }
  | { ok: false; feil: string };

/** Ny ukedag (0 = mandag … 6 = søndag) og klokkeslett for en fast økt i ukemalen. */
export function lesFlytting(input: { ukedag: unknown; start: unknown; slutt: unknown }): FlyttInput {
  const ukedag = typeof input.ukedag === "string" && /^[0-6]$/.test(input.ukedag) ? Number(input.ukedag) : null;
  if (ukedag === null) return { ok: false, feil: "Velg en dag." };
  const start = lesKlokke(input.start);
  const slutt = lesKlokke(input.slutt);
  if (start === null || slutt === null) return { ok: false, feil: "Skriv klokkeslett som TT:MM." };
  if (slutt <= start) return { ok: false, feil: "Slutt må være etter start." };
  return { ok: true, ukedag, start: String(input.start).trim(), slutt: String(input.slutt).trim() };
}

/** «YYYY-MM-DD» flyttet `dager` dager (kalenderdager, uavhengig av sommertid). */
export function leggTilDagerIso(iso: string, dager: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + dager)).toISOString().slice(0, 10);
}
