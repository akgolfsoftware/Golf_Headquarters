/**
 * Google Disk-klient for Meg-assistenten. Gjenbruker Google-OAuth fra
 * google-calendar.ts. Tilkoblingen må ha Drive-scopes (re-godkjenn én gang
 * via /api/google-calendar/connect?meg=1).
 */
import { google, type drive_v3 } from "googleapis";
import { getOAuth2Client, decryptToken } from "@/lib/google-calendar";
import type { GoogleCalendarConnection } from "@/generated/prisma/client";

export function getDriveApi(connection: GoogleCalendarConnection): drive_v3.Drive {
  const refreshToken = decryptToken(connection.refreshTokenCipher);
  const oauth = getOAuth2Client();
  oauth.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: "v3", auth: oauth });
}
