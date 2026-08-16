/**
 * Delt helper: henter ADMIN-brukerens aktive Google-tilkobling.
 *
 * Dette er NØYAKTIG samme mønster som getOwnerConnection() i
 * src/lib/meg/connectors/google.ts (samme spørring, samme ADMIN+ACTIVE-
 * filter — Mulligan-triagen gjenbruker Meg-botens Google-tilkobling, ikke en
 * ny auth-vei). Mønsteret er KOPIERT hit, ikke importert derfra, fordi
 * src/lib/meg/connectors/google.ts har `import "server-only"` — den pakken
 * kaster en hard feil ved import med mindre "react-server"-export-
 * conditionen er aktiv. `mulligan:triage`-scriptet kjører derfor med
 * `tsx --conditions=react-server` (samme mønster som `npm test`) — nødvendig
 * fordi src/lib/google-calendar.ts transitivt drar inn server-only-filer
 * (notifications → push/send, error-tracking). Kopien her beholdes likevel
 * for å holde scriptets egen importflate minimal.
 */
import { prisma } from "@/lib/prisma";
import type { GoogleCalendarConnection } from "@/generated/prisma/client";

export async function hentAdminGoogleTilkobling(): Promise<GoogleCalendarConnection | null> {
  return prisma.googleCalendarConnection.findFirst({
    where: { user: { role: "ADMIN" }, status: "ACTIVE" },
  });
}
