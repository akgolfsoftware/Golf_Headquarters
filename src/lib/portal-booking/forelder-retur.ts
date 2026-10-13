import "server-only";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";

const LEVETID_SEKUNDER = 35 * 60;
const Referanse = z.string().uuid();
const Returkontekst = z.object({
  parentId: z.string().min(1).max(128),
  childId: z.string().min(1).max(128),
  expiresAt: z.number().int().positive(),
});
const cookieNavn = (referanse: string) => `ak-booking-retur-${referanse}`;

/** Stripe får bare en tilfeldig referanse. Barnekonteksten blir på appdomenet. */
export async function opprettForelderBookingRetur(parentId: string, childId: string): Promise<string> {
  const referanse = randomUUID();
  const kontekst = Returkontekst.parse({ parentId, childId, expiresAt: Date.now() + LEVETID_SEKUNDER * 1000 });
  const jar = await cookies();
  jar.set(cookieNavn(referanse), JSON.stringify(kontekst), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/forelder/bookinger",
    maxAge: LEVETID_SEKUNDER,
  });
  return referanse;
}

/**
 * Kun valgt barn i UI: aldri betaling, kvittering eller selvstendig tilgang.
 * Listen må komme fra sidens aktive, serverautoriserte forelderrelasjoner.
 * Cookieinnhold regnes som ubetrodd og kontrolleres mot innlogget foresatt.
 */
export async function lesForelderBookingRetur(retur: unknown, parentId: string, godkjenteBarnIds: readonly string[]): Promise<string | null> {
  const referanse = Referanse.safeParse(retur);
  if (!referanse.success || godkjenteBarnIds.length === 0) return null;
  const jar = await cookies();
  const verdi = jar.get(cookieNavn(referanse.data))?.value;
  if (!verdi || verdi.length > 512) return null;
  try {
    const parsed = Returkontekst.safeParse(JSON.parse(verdi));
    if (!parsed.success) return null;
    const data = parsed.data;
    const now = Date.now();
    if (data.parentId !== parentId || data.expiresAt <= now || data.expiresAt > now + LEVETID_SEKUNDER * 1000) return null;
    return godkjenteBarnIds.includes(data.childId) ? data.childId : null;
  } catch { return null; }
}
