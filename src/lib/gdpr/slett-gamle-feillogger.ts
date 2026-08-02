/**
 * Retensjon for feillogger: ErrorLog-rader eldre enn 90 dager slettes.
 *
 * Personvernerklæringen sier «feillogger: 90 dager». Denne jobben er det som
 * gjør påstanden sann — uten den vokser tabellen i det uendelige.
 */
import "server-only";
import { prisma } from "@/lib/prisma";

export const FEILLOGG_RETENSJON_DAGER = 90;

/** Grensen rader må være eldre enn for å slettes. */
export function feilloggKuttdato(naa: Date = new Date()): Date {
  return new Date(naa.getTime() - FEILLOGG_RETENSJON_DAGER * 24 * 60 * 60 * 1000);
}

/** Sletter utgåtte feillogger. Returnerer antall slettede rader. */
export async function slettGamleFeillogger(naa: Date = new Date()): Promise<number> {
  const res = await prisma.errorLog.deleteMany({
    where: { createdAt: { lt: feilloggKuttdato(naa) } },
  });
  return res.count;
}
