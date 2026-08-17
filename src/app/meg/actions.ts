"use server";

/**
 * Server actions for /meg — gullregelen fra nattsesjon-prompt Fase 2 punkt 3:
 * «ingen mutasjon uten eksplisitt godkjenn-handling». Disse to er eneste vei
 * til å endre en Saks status.
 *
 * Dispatch til kanalen (faktisk sende svaret via Gmail/SMS/iMessage) er
 * BEVISST IKKE koblet på her — Google-tilkoblingen mangler fortsatt
 * Gmail-send-scope (se ak-brain/prosjekter/akgolf-hq.md, 16.08: blokkert på
 * /api/google-calendar/connect?meg=1). godkjennSak markerer coachens
 * beslutning i databasen; selve utsendelsen er et eget steg som krever at
 * scope-fiksen er på plass og bør bygges med egen gjennomgang av Anders,
 * ikke stilltiende her. UI-en viser derfor «Godkjent», ikke «Sendt via
 * Gmail» — se natt-rapport.md.
 */
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { SakStatus } from "@/generated/prisma/enums";

async function kreverAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();
  return user;
}

export async function godkjennSak(id: string): Promise<{ ok: true } | { ok: false; feil: string }> {
  await kreverAdmin();
  try {
    await prisma.sak.update({ where: { id }, data: { status: SakStatus.GODKJENT } });
  } catch {
    return { ok: false, feil: "Fant ikke saken — den kan allerede være behandlet." };
  }
  revalidatePath("/meg");
  return { ok: true };
}

export async function avvisSak(id: string): Promise<{ ok: true } | { ok: false; feil: string }> {
  await kreverAdmin();
  try {
    await prisma.sak.update({ where: { id }, data: { status: SakStatus.AVVIST } });
  } catch {
    return { ok: false, feil: "Fant ikke saken — den kan allerede være behandlet." };
  }
  revalidatePath("/meg");
  return { ok: true };
}
