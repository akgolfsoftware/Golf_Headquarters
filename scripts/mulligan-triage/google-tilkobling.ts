/**
 * Delt helper: henter ADMIN-brukerens aktive Google-tilkobling.
 *
 * Dette er NØYAKTIG samme mønster som getOwnerConnection() i
 * src/lib/meg/connectors/google.ts (samme spørring, samme ADMIN+ACTIVE-
 * filter — Mulligan-triagen gjenbruker Meg-botens Google-tilkobling, ikke en
 * ny auth-vei). Mønsteret er KOPIERT hit, ikke importert derfra, fordi
 * src/lib/meg/connectors/google.ts har `import "server-only"` — den pakken
 * kaster en hard feil ved import med mindre "react-server"-export-
 * conditionen er aktiv (slik `npm test` setter den med
 * `--conditions=react-server`). Dette scriptet kjøres derimot som et rent
 * tsx-script via LaunchAgent/cron uten den flagget, så server-only-filer kan
 * ikke lastes direkte. src/lib/google-gmail.ts og src/lib/google-calendar.ts
 * har IKKE server-only-guard og importeres derfor rett fra scriptets øvrige
 * filer.
 */
import { prisma } from "@/lib/prisma";
import type { GoogleCalendarConnection } from "@/generated/prisma/client";

export async function hentAdminGoogleTilkobling(): Promise<GoogleCalendarConnection | null> {
  return prisma.googleCalendarConnection.findFirst({
    where: { user: { role: "ADMIN" }, status: "ACTIVE" },
  });
}
