// Rene regler for WANG Administrasjon (pakke W4): invitasjonslenke for trener og unntak i timeplanen.
// Ingen DB, testbart uten Prisma.

import { createHash, randomBytes } from "node:crypto";
import { WANG_UNNTAK_MAKS_TEGN } from "./wang-admin-grenser";

export { WANG_UNNTAK_MAKS_TEGN };

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
  if (tekst.length > WANG_UNNTAK_MAKS_TEGN) return { ok: false, feil: `Høyst ${WANG_UNNTAK_MAKS_TEGN} tegn.` };
  return { ok: true, fraDato, tilDato: tilDato && tilDato.getTime() === fraDato.getTime() ? null : tilDato, tekst };
}
