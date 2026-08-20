"use server";

/**
 * Server actions for /meg — gullregelen fra nattsesjon-prompt Fase 2 punkt 3:
 * «ingen mutasjon uten eksplisitt godkjenn-handling».
 *
 * godkjennSak/avvisSak er tynne wrappere rundt den DELTE implementasjonen i
 * src/lib/saker/godkjenn.ts — samme statusvakter (kun VENTER kan avgjøres,
 * idempotent) og samme sideeffekt som Godkjenn-knappen i AgencyOS → Innboks
 * og Telegram BEKREFT (src/lib/meg/confirm.ts): for EPOST-saker opprettes et
 * Gmail-UTKAST fra foreslattSvar FØR status settes. Det sendes ALDRI noe
 * automatisk — Anders leser, redigerer om nødvendig og sender selv fra
 * Gmail. UI-en kan derfor si «Gmail-utkast opprettet», men aldri «Sendt».
 */
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { godkjennSak as godkjennSakDelt, avvisSak as avvisSakDelt } from "@/lib/saker/godkjenn";
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
  const resultat = await godkjennSakDelt(id);
  if (!resultat.ok) return { ok: false, feil: resultat.feil ?? "Kunne ikke godkjenne saken." };
  revalidatePath("/meg");
  return { ok: true };
}

export async function avvisSak(id: string): Promise<{ ok: true } | { ok: false; feil: string }> {
  await kreverAdmin();
  const resultat = await avvisSakDelt(id);
  if (!resultat.ok) return { ok: false, feil: resultat.feil ?? "Kunne ikke avvise saken." };
  revalidatePath("/meg");
  return { ok: true };
}

/**
 * Persisterer et redigert svarutkast FØR godkjenning — lib-godkjennSak leser
 * foreslattSvar fra databasen, så en ren klient-redigering ville ellers gått
 * tapt. Kun saker som fortsatt VENTER kan endres (statusvakten ligger i
 * where-betingelsen, atomisk via updateMany).
 */
export async function oppdaterForeslattSvar(
  id: string,
  tekst: string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  await kreverAdmin();
  const renTekst = tekst.trim();
  if (!renTekst) return { ok: false, feil: "Svaret kan ikke være tomt." };
  try {
    const oppdatert = await prisma.sak.updateMany({
      where: { id, status: SakStatus.VENTER },
      data: { foreslattSvar: renTekst },
    });
    if (oppdatert.count === 0) {
      return { ok: false, feil: "Saken er allerede avgjort — svaret kan ikke endres." };
    }
  } catch {
    return { ok: false, feil: "Kunne ikke lagre svaret. Prøv igjen." };
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
