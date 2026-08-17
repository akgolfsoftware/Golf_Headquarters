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
import { SakKanal, SakStatus } from "@/generated/prisma/enums";
import { FANGST_TYPER, FANGST_TYPE_LABEL, STANDARD_INNSTILLINGER, type FangstType, type InnstillingEndring } from "@/lib/jarvis/types";
import type { Prisma } from "@/generated/prisma/client";

async function kreverAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();
  return user;
}

/**
 * Fangsten-frist: ingen tredjepart venter på svar (dette er Anders' egen
 * notering, ikke en innkommende henvendelse), så SAKER_SLA_TIMER (6t,
 * scripts/saker-innsamling/env.ts) passer ikke. 24t er en enkel, forklarbar
 * standard — nok tid til at «husk til i morgen»-fangster fortsatt vises som
 * "venter" gjennom morgendagen.
 */
const FANGST_FRIST_MS = 24 * 60 * 60 * 1000;

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

/**
 * Fangsten (skjerm 12) — under 20 sekunder, én hånd: en rask notering havner
 * som ny Sak (kanal TASK, status VENTER) i den vanlige køen, «triage sorterer
 * resten» (fasitens formulering — ingen egen klassifisering skjer her, det er
 * samme jobb triage-agenten allerede gjør for de andre kanalene).
 */
export async function opprettFangst(
  type: FangstType,
  tekst: string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  await kreverAdmin();
  const renTekst = tekst.trim();
  if (!renTekst) return { ok: false, feil: "Tom tekst — ingenting å fange." };
  if (!FANGST_TYPER.includes(type)) return { ok: false, feil: "Ukjent fangst-type." };

  const naa = new Date();
  await prisma.sak.create({
    data: {
      kanal: SakKanal.TASK,
      avsender: "Egen fangst",
      emne: FANGST_TYPE_LABEL[type],
      innhold: renTekst,
      status: SakStatus.VENTER,
      kildeId: null,
      frist: new Date(naa.getTime() + FANGST_FRIST_MS),
      provenance: { kilde: "fangst", type, opprettet: naa.toISOString() },
    },
  });
  revalidatePath("/meg");
  return { ok: true };
}

/**
 * Fullt typet felt → Prisma-data-mapping — unngår `{ [felt]: verdi }` mot en
 * union-nøkkel, som ikke lar seg typesjekke uten en usikker cast (forbudt
 * for forretningskritiske data, CLAUDE.md invariant 6 — behandlet likt her
 * selv om innstillinger er lavere risiko enn Sak-data).
 */
function endringTilData(e: InnstillingEndring): Prisma.JarvisInnstillingUpdateInput {
  switch (e.felt) {
    case "kanalGmail":
      return { kanalGmail: e.verdi };
    case "kanalImessage":
      return { kanalImessage: e.verdi };
    case "kanalTelegram":
      return { kanalTelegram: e.verdi };
    case "kanalAnrop":
      return { kanalAnrop: e.verdi };
    case "kanalKalender":
      return { kanalKalender: e.verdi };
    case "stemmeAktivert":
      return { stemmeAktivert: e.verdi };
    case "stilleTidsromAktivert":
      return { stilleTidsromAktivert: e.verdi };
    case "slaTerskelTimer":
      return { slaTerskelTimer: e.verdi };
  }
}

/**
 * Innstillingene (skjerm 11) — én bryter/valg om gangen, autolagres (fasitens
 * "Lagres automatisk"). Ekte skriving til JarvisInnstilling, men INGEN
 * forbruker leser feltene tilbake ennå (se repository.ts sin doc-kommentar)
 * — verdien persisteres, men endrer ikke faktisk innsamler-/SLA-/stemme-
 * oppførsel i denne PR-en.
 */
export async function oppdaterInnstilling(endring: InnstillingEndring): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await kreverAdmin();
  try {
    await prisma.jarvisInnstilling.upsert({
      where: { userId: user.id },
      // Full create-payload fra STANDARD_INNSTILLINGER + det ene endrede feltet —
      // ikke en spredning av UpdateInput (feltene der aksepterer også Prisma sine
      // *FieldUpdateOperationsInput-varianter, som ikke er gyldige i CreateInput).
      create: { userId: user.id, ...STANDARD_INNSTILLINGER, [endring.felt]: endring.verdi },
      update: endringTilData(endring),
    });
  } catch {
    return { ok: false, feil: "Kunne ikke lagre innstillingen." };
  }
  revalidatePath("/meg");
  return { ok: true };
}
