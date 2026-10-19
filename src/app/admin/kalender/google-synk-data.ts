/**
 * Google Calendar-koblingen til coachen, for fanen Tilgjengelighet i Kalender.
 * Samme oppslag som CalendarSyncSection på den gamle /admin/availability.
 */
import { prisma } from "@/lib/prisma";

export type GoogleKalender = {
  id: string;
  navn: string;
  farge: string | null;
  push: boolean;
  pull: boolean;
  visIKalender: boolean;
  aktiv: boolean;
  feil: string | null;
};

export type GoogleSynkData =
  | { koblet: false }
  | {
      koblet: true;
      epost: string;
      status: string;
      sisteSynk: string | null;
      sisteFeil: string | null;
      kalendere: GoogleKalender[];
    };

export async function hentGoogleSynk(userId: string): Promise<GoogleSynkData> {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
    include: { subscriptions: { orderBy: [{ syncPush: "desc" }, { calendarName: "asc" }] } },
  });
  if (!conn) return { koblet: false };
  return {
    koblet: true,
    epost: conn.googleEmail,
    status: conn.status,
    sisteSynk: conn.lastSyncAt ? conn.lastSyncAt.toISOString() : null,
    sisteFeil: conn.lastError,
    kalendere: conn.subscriptions.map((s) => ({
      id: s.id,
      navn: s.calendarName,
      farge: s.color,
      push: s.syncPush,
      pull: s.syncPull,
      visIKalender: s.visIKalender,
      aktiv: s.active,
      feil: s.lastError,
    })),
  };
}
