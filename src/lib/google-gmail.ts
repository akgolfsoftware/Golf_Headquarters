/**
 * Gmail-klient for Meg-assistenten. Gjenbruker Google-OAuth fra
 * google-calendar.ts (samme kryptering, samme OAuth2-klient). Tilkoblingen
 * (GoogleCalendarConnection) må ha Gmail-scopes — Anders re-godkjenner én gang
 * via /api/google-calendar/connect?meg=1.
 */
import { google, type gmail_v1 } from "googleapis";
import { getOAuth2Client, decryptToken } from "@/lib/google-calendar";
import type { GoogleCalendarConnection } from "@/generated/prisma/client";

export function getGmailApi(connection: GoogleCalendarConnection): gmail_v1.Gmail {
  const refreshToken = decryptToken(connection.refreshTokenCipher);
  const oauth = getOAuth2Client();
  oauth.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: "v1", auth: oauth });
}

/** RFC 2047 encoded-word for header-verdier med ikke-ASCII (æøå). */
function encodeHeader(value: string): string {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

/**
 * Bygger base64url-kodet RFC822-melding. `svarPaaRfc822MessageId` er den
 * ORIGINALE meldingens RFC822 `Message-ID`-header (IKKE Gmails interne
 * API-messageId) — sett den for at Gmail skal vise utkastet som et korrekt
 * trådet svar (In-Reply-To/References).
 */
export function buildRawMessage(args: {
  til: string;
  emne: string;
  tekst: string;
  svarPaaRfc822MessageId?: string;
}): string {
  const headers = [
    `To: ${args.til}`,
    `Subject: ${encodeHeader(args.emne)}`,
    ...(args.svarPaaRfc822MessageId
      ? [
          `In-Reply-To: <${args.svarPaaRfc822MessageId.replace(/^<|>$/g, "")}>`,
          `References: <${args.svarPaaRfc822MessageId.replace(/^<|>$/g, "")}>`,
        ]
      : []),
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    args.tekst,
  ];
  return Buffer.from(headers.join("\r\n"), "utf8").toString("base64url");
}

/**
 * Oppretter et Gmail-UTKAST — sender ALDRI. `threadId` kobler utkastet til en
 * eksisterende tråd slik at det vises som svar der i Gmail. Generisk
 * Gmail-mulighet (brukt av Mulligan-triagen i
 * scripts/mulligan-triage/gmail-utkast.ts) — lagt her sammen med
 * getGmailApi/buildRawMessage fremfor duplisert i scriptet.
 * Returnerer utkastets ID ved suksess, null ved feil (aldri en hard
 * avhengighet — kalleren logger/rapporterer selv).
 */
export async function createGmailDraft(
  connection: GoogleCalendarConnection,
  args: { til: string; emne: string; tekst: string; threadId?: string; svarPaaRfc822MessageId?: string },
): Promise<string | null> {
  try {
    const gmail = getGmailApi(connection);
    const raw = buildRawMessage(args);
    const res = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: { raw, threadId: args.threadId },
      },
    });
    return res.data.id ?? null;
  } catch (err) {
    console.error("[google-gmail] Kunne ikke opprette utkast:", err instanceof Error ? err.message : err);
    return null;
  }
}
