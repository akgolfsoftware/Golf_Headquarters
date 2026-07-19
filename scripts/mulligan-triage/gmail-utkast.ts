/**
 * Oppretter Gmail-svarutkast for booking-forespørsler. ALDRI `.send()` noe
 * sted i denne filen — kun `drafts.create` (jf. mulligan-drift.md:
 * "Aldri send e-post/SMS til kunder uten Anders' godkjenning — lag alltid
 * utkast"). Anders leser, redigerer om nødvendig og sender selv fra Gmail.
 *
 * Selve drafts.create-kallet er en generisk Gmail-mulighet og ligger derfor
 * i src/lib/google-gmail.ts (createGmailDraft) sammen med getGmailApi/
 * buildRawMessage — ikke duplisert her.
 */
import { getGmailApi, createGmailDraft } from "@/lib/google-gmail";
import { hentAdminGoogleTilkobling } from "./google-tilkobling";
import type { gmail_v1 } from "googleapis";

function headerValue(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, navn: string): string {
  const h = headers?.find((x) => x.name?.toLowerCase() === navn.toLowerCase());
  return h?.value ?? "";
}

/**
 * Oppretter et svarutkast i tråden til den innkommende e-posten. Henter
 * opprinnelig avsender + emne fra selve meldingen (messageId) for å bygge et
 * korrekt "Re:"-svar — kalleren trenger derfor ikke kjenne kundens
 * e-postadresse på forhånd.
 *
 * Returnerer true ved suksess, false ved enhver feil (manglende tilkobling,
 * nettverk, API) — kalleren logger da for manuell oppfølging i stedet.
 */
export async function opprettSvarUtkast(
  threadId: string,
  messageId: string,
  tekst: string,
): Promise<boolean> {
  try {
    const conn = await hentAdminGoogleTilkobling();
    if (!conn) {
      console.warn("[mulligan-triage/gmail-utkast] Ingen aktiv Google-tilkobling (ADMIN) — kan ikke opprette utkast.");
      return false;
    }

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
      console.warn("[mulligan-triage/gmail-utkast] Fant ikke avsender på original melding — hopper over utkast.");
      return false;
    }
    const emneOriginal = headerValue(headers, "Subject") || "(uten emne)";
    const emne = /^re:/i.test(emneOriginal) ? emneOriginal : `Re: ${emneOriginal}`;
    const rfcMessageId = headerValue(headers, "Message-ID") || undefined;

    const utkastId = await createGmailDraft(conn, {
      til: fra,
      emne,
      tekst,
      threadId,
      svarPaaRfc822MessageId: rfcMessageId,
    });
    return utkastId !== null;
  } catch (err) {
    console.error(
      "[mulligan-triage/gmail-utkast] Kunne ikke opprette svarutkast:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
