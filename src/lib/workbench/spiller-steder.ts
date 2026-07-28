/**
 * Spillerens navngitte treningssteder (2026-07-27) — fylles i onboarding steg 3
 * og brukes som lokasjonsvalg når en økt planlegges i Workbench.
 *
 * Read-only. Tom liste er en helt normal tilstand (spilleren hoppet over steget),
 * og da faller økt-arket tilbake på fritekst.
 */
import { prisma } from "@/lib/prisma";

export type SpillerSted = {
  id: string;
  name: string;
  isIndoor: boolean;
};

export async function hentSpillerSteder(userId: string): Promise<SpillerSted[]> {
  return prisma.playerFacility.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, isIndoor: true },
  });
}
