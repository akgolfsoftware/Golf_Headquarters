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

/** Bygger base64url-kodet RFC822-melding. */
export function buildRawMessage(args: { til: string; emne: string; tekst: string }): string {
  const headers = [
    `To: ${args.til}`,
    `Subject: ${encodeHeader(args.emne)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    args.tekst,
  ];
  return Buffer.from(headers.join("\r\n"), "utf8").toString("base64url");
}
