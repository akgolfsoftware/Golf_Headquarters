/**
 * Delt godkjenn/avvis-logikk for én Sak (Jarvis steg 4/7).
 *
 * Brukt av BEGGE veiene inn: Godkjenn/Avvis-knappene i InnboksSaker
 * (src/app/admin/innboks/actions.ts) OG Telegram BEKREFT-flyten
 * (src/lib/meg/confirm.ts, tool_name "sak_godkjenn"). Samlet her, ikke
 * duplisert i to steder, slik at reglene for hva som skjer ved godkjenning
 * (og hvilke statusoverganger som er lovlige) kun finnes ett sted.
 *
 * Oppretter et Gmail-UTKAST fra Sak.foreslattSvar for e-post-saker — ALDRI
 * `.send()` (jf. .claude/rules/mulligan-drift.md: "Aldri send e-post/SMS til
 * kunder uten Anders' godkjenning — lag alltid utkast"). Anders leser,
 * redigerer om nødvendig og sender selv fra Gmail.
 *
 * Andre kanaler (SMS/iMessage/Telegram/anrop/kalender/oppgave) har ingen
 * utkast-mekanisme i dette repoet ennå — Godkjenn markerer da saken GODKJENT
 * uten noen sideeffekt utover det. Utvides den dagen en slik kanal får en
 * faktisk utkast-vei.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { getGmailApi, createGmailDraft } from "@/lib/google-gmail";
import type { GoogleCalendarConnection } from "@/generated/prisma/client";

export type GodkjennResultat = { ok: boolean; feil?: string };

function headerValue(
  headers: { name?: string | null; value?: string | null }[] | undefined,
  navn: string,
): string {
  const h = headers?.find((x) => x.name?.toLowerCase() === navn.toLowerCase());
  return h?.value ?? "";
}

/**
 * Samme spørring som getOwnerConnection() i src/lib/meg/connectors/google.ts
 * — hentet inn direkte her (ikke importert) for å holde denne fila fri for
 * Meg-botens tool-registrering og heller kun avhengig av prisma + Gmail.
 */
async function hentAdminGoogleTilkobling(): Promise<GoogleCalendarConnection | null> {
  return prisma.googleCalendarConnection.findFirst({
    where: { user: { role: "ADMIN" }, status: "ACTIVE" },
  });
}

/**
 * Oppretter et Gmail-svarutkast i tråden til den opprinnelige meldingen.
 * `messageId` er Sak.kildeId (Gmail-meldingens API-id, satt av
 * scripts/saker-innsamling/gmail.ts ved innsamling). Henter avsender/emne/
 * RFC822 Message-ID + tråd-id fra selve meldingen, slik at kalleren ikke
 * trenger å kjenne kundens e-postadresse på forhånd.
 *
 * Returnerer true ved suksess, false ved enhver feil (manglende tilkobling,
 * nettverk, API, manglende avsender-header).
 */
async function opprettGmailUtkastForSak(messageId: string, tekst: string): Promise<boolean> {
  const conn = await hentAdminGoogleTilkobling();
  if (!conn) {
    console.warn("[saker/godkjenn] Ingen aktiv Google-tilkobling (ADMIN) — kan ikke opprette utkast.");
    return false;
  }
  try {
    const gmail = getGmailApi(conn);
    const original = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Message-ID"],
    });
    const headers = original.data.payload?.headers ?? undefined;
    const fra = headerValue(headers, "From");
    if (!fra) {
      console.warn("[saker/godkjenn] Fant ikke avsender på original melding — hopper over utkast.");
      return false;
    }
    const emneOriginal = headerValue(headers, "Subject") || "(uten emne)";
    const emne = /^re:/i.test(emneOriginal) ? emneOriginal : `Re: ${emneOriginal}`;
    const rfcMessageId = headerValue(headers, "Message-ID") || undefined;
    const threadId = original.data.threadId ?? undefined;

    const utkastId = await createGmailDraft(conn, {
      til: fra,
      emne,
      tekst,
      threadId,
      svarPaaRfc822MessageId: rfcMessageId,
    });
    return utkastId !== null;
  } catch (err) {
    console.error("[saker/godkjenn] Kunne ikke opprette svarutkast:", err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * Godkjenner en Sak. For kanal EPOST kreves et foreslattSvar (skrevet av
 * triage-agenten) OG en kildeId (Gmail-meldingsid) — mangler ett av delene,
 * avvises handlingen med en forklarende feil i stedet for å late som noe
 * ble gjort. Idempotent: en allerede godkjent sak returnerer ok=true uten å
 * opprette et nytt utkast (Telegram BEKREFT kan i prinsippet komme to
 * ganger for samme sak).
 */
export async function godkjennSak(sakId: string): Promise<GodkjennResultat> {
  const sak = await prisma.sak.findUnique({ where: { id: sakId } });
  if (!sak) return { ok: false, feil: "Fant ikke saken." };
  if (sak.status === "GODKJENT") return { ok: true };
  if (sak.status !== "VENTER") return { ok: false, feil: "Saken er allerede avgjort." };

  if (sak.kanal === "EPOST") {
    if (!sak.foreslattSvar?.trim()) {
      return { ok: false, feil: "Ingen foreslått svar å opprette utkast fra ennå." };
    }
    if (!sak.kildeId) {
      return { ok: false, feil: "Mangler Gmail-meldingsid — kan ikke opprette utkast." };
    }
    const opprettet = await opprettGmailUtkastForSak(sak.kildeId, sak.foreslattSvar);
    if (!opprettet) {
      return { ok: false, feil: "Kunne ikke opprette Gmail-utkast. Prøv igjen." };
    }
  }

  await prisma.sak.update({ where: { id: sak.id }, data: { status: "GODKJENT" } });
  return { ok: true };
}

/** Avviser en Sak. Idempotent på samme måte som godkjennSak(). */
export async function avvisSak(sakId: string): Promise<GodkjennResultat> {
  const sak = await prisma.sak.findUnique({ where: { id: sakId }, select: { id: true, status: true } });
  if (!sak) return { ok: false, feil: "Fant ikke saken." };
  if (sak.status === "AVVIST") return { ok: true };
  if (sak.status !== "VENTER") return { ok: false, feil: "Saken er allerede avgjort." };

  await prisma.sak.update({ where: { id: sak.id }, data: { status: "AVVIST" } });
  return { ok: true };
}
