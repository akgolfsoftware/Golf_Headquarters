/**
 * Delt helper: henter ADMIN-brukerens aktive Google-tilkobling.
 *
 * Dette er NØYAKTIG samme mønster som getOwnerConnection() i
 * src/lib/meg/connectors/google.ts (samme spørring, samme ADMIN+ACTIVE-
 * filter — gjenbruker Meg-botens Google-tilkobling, ikke en ny auth-vei).
 * Mønsteret er KOPIERT hit (samme kopi som scripts/mulligan-triage/
 * google-tilkobling.ts), ikke importert derfra eller fra
 * src/lib/meg/connectors/google.ts: sistnevnte har `import "server-only"` —
 * den pakken kaster en hard feil ved import med mindre "react-server"-
 * export-conditionen er aktiv. `saker:gmail`-scriptet kjører derfor med
 * `tsx --conditions=react-server` (samme mønster som mulligan-triage) —
 * nødvendig fordi src/lib/google-calendar.ts transitivt drar inn
 * server-only-filer. Hver innsamler-mappe eier sin egen kopi av dette
 * mønsteret (se scripts/mulligan-triage/README.md, "Filer").
 */
import { prisma } from "@/lib/prisma";
import type { GoogleCalendarConnection } from "@/generated/prisma/client";

export async function hentAdminGoogleTilkobling(): Promise<GoogleCalendarConnection | null> {
  return prisma.googleCalendarConnection.findFirst({
    where: { user: { role: "ADMIN" }, status: "ACTIVE" },
  });
}
