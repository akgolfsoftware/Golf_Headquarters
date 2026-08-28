/**
 * PH-01c/PH-01d — "Siste TrackMan"-kortet på "I dag". Henter spillerens
 * NYESTE TrackMan-økt og bygger den ene setningen kortet viser. Returnerer
 * `null` når spilleren ikke har noen økt (kortet skjules helt, PH-01d) ELLER
 * når hentingen feiler (§Feilhåndtering, CLAUDE.md §7: dette kortet er
 * valgfritt — en feilet spørring skal skjule kortet, IKKE krasje "I dag").
 */

import { prisma } from "@/lib/prisma";
import { computeTrackManDispersionMap, generateCaddieSentence } from "@/lib/trackman/dispersion-map";

export type TrackManTeaser = { sessionId: string; club: string; dateText: string; sentence: string };

export async function getTrackManTeaser(userId: string): Promise<TrackManTeaser | null> {
  try {
    const sesjon = await prisma.trackManSession.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    });
    if (!sesjon) return null;

    const shots = await prisma.trackManShot.findMany({
      where: { sessionId: sesjon.id },
      orderBy: { shotNumber: "asc" },
      select: {
        id: true,
        shotNumber: true,
        club: true,
        side: true,
        carryDistance: true,
        totalDistance: true,
        smashFactor: true,
        launchAngle: true,
      },
    });
    if (shots.length === 0) return null;

    // Kølla med flest gyldige (side + carry) slag — samme regel som TM-11.
    const perKolle = new Map<string, typeof shots>();
    for (const s of shots) {
      if (s.side == null || s.carryDistance == null) continue;
      perKolle.set(s.club, [...(perKolle.get(s.club) ?? []), s]);
    }
    let valgtKolle = shots[0].club;
    let flest = -1;
    for (const [kolle, liste] of perKolle) {
      if (liste.length > flest) {
        flest = liste.length;
        valgtKolle = kolle;
      }
    }
    const kolleShots = shots.filter((s) => s.club === valgtKolle);
    if (kolleShots.length === 0) return null;

    const result = computeTrackManDispersionMap(kolleShots);
    // PH-01c: én caddie-setning. Uten den (for få slag / ingen bias) er kortet
    // PH-01d — skjult. Aldri vis «0 slag registrert» som tom-innhold.
    const sentence = generateCaddieSentence(result.offlineBias, result.n);
    if (!sentence) return null;

    const dateText = sesjon.recordedAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });

    return { sessionId: sesjon.id, club: valgtKolle, dateText, sentence };
  } catch {
    // Skjul kortet stille — "I dag" skal aldri krasje på et valgfritt kort.
    return null;
  }
}
