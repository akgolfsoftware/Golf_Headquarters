import { prisma } from "@/lib/prisma";
import {
  STANDARD_PH17_DATA,
  beregnGappingRader,
  type PH17TrackManData,
  type TrackManSessionItem,
  type TrackManClubStats,
} from "./ph17-trackman-data";

/**
 * Laster TrackMan-data for innlogget spiller.
 * Henter faktiske økter og slag fra databasen og beregner snitt og gapping.
 * Mangler det data, brukes det representative grunnlaget fra Claude Design PH-17.
 */
export async function loadPH17TrackMan(
  userId: string,
  brukerNavn?: string
): Promise<PH17TrackManData> {
  try {
    const [user, sessions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
      prisma.trackManSession.findMany({
        where: { userId },
        orderBy: { recordedAt: "desc" },
        take: 10,
        include: {
          shots: {
            orderBy: { shotNumber: "asc" },
            select: {
              club: true,
              side: true,
              carryDistance: true,
              totalDistance: true,
              clubSpeed: true,
              ballSpeed: true,
              smashFactor: true,
              launchAngle: true,
              clubPath: true,
              faceToPath: true,
              spinRate: true,
            },
          },
        },
      }),
    ]);

    const spillerNavn = user?.name || brukerNavn || STANDARD_PH17_DATA.station.spillerNavn;

    // Hvis ingen økter finnes, returner standarddata med oppdatert navn
    if (sessions.length === 0) {
      return {
        ...STANDARD_PH17_DATA,
        station: {
          ...STANDARD_PH17_DATA.station,
          spillerNavn,
        },
      };
    }

    // Bygg øktliste
    const sessionItems: TrackManSessionItem[] = sessions.map((s, idx) => {
      const d = s.recordedAt;
      const dag = String(d.getDate()).padStart(2, "0");
      const mnd = String(d.getMonth() + 1).padStart(2, "0");
      const dateStr = `${dag}.${mnd}.${d.getFullYear()}`;
      const unikeKoller = Array.from(new Set(s.shots.map((shot) => shot.club))).filter(Boolean);

      let tittel = "TrackMan-økt";
      if (unikeKoller.some((c) => c.includes("5") || c.includes("PW"))) tittel = "Wedge-lengder";
      else if (unikeKoller.some((c) => c.includes("Driver"))) tittel = "Full bag · kontroll";
      else if (unikeKoller.some((c) => c.includes("6i") || c.includes("7i"))) tittel = "Innspill";

      return {
        id: s.id,
        date: dateStr,
        bay: `Bay ${(idx % 3) + 1}`,
        shots: s.shots.length,
        clubs: unikeKoller.length > 0 ? unikeKoller : ["7i"],
        title: tittel,
      };
    });

    // Grupper slag per kølle
    const shotsPerClub: Record<string, Array<[number, number]>> = { ...STANDARD_PH17_DATA.shots };
    const clubStats: Record<string, TrackManClubStats> = { ...STANDARD_PH17_DATA.clubStats };

    const slagGruppert = new Map<string, typeof sessions[0]["shots"]>();
    for (const sesh of sessions) {
      for (const shot of sesh.shots) {
        if (!shot.club) continue;
        const liste = slagGruppert.get(shot.club) ?? [];
        liste.push(shot);
        slagGruppert.set(shot.club, liste);
      }
    }

    const gapKilde: Array<[string, number, number]> = [];

    for (const [kølle, slag] of slagGruppert.entries()) {
      const gyldigeCarry = slag.filter((s) => s.carryDistance != null && s.carryDistance > 0);
      if (gyldigeCarry.length === 0) continue;

      // 2D punkter (side, carry)
      const punkter: Array<[number, number]> = slag
        .filter((s) => s.side != null && s.carryDistance != null)
        .map((s) => [s.side as number, s.carryDistance as number]);

      if (punkter.length > 0) {
        shotsPerClub[kølle] = punkter;
      }

      // Beregn snitt
      const snittCarry = gyldigeCarry.reduce((sum, s) => sum + (s.carryDistance ?? 0), 0) / gyldigeCarry.length;
      const snittClubSpeed = slag.filter((s) => s.clubSpeed != null).reduce((sum, s) => sum + (s.clubSpeed ?? 0), 0) / (slag.filter((s) => s.clubSpeed != null).length || 1);
      const snittBallSpeed = slag.filter((s) => s.ballSpeed != null).reduce((sum, s) => sum + (s.ballSpeed ?? 0), 0) / (slag.filter((s) => s.ballSpeed != null).length || 1);
      const snittSmash = slag.filter((s) => s.smashFactor != null).reduce((sum, s) => sum + (s.smashFactor ?? 0), 0) / (slag.filter((s) => s.smashFactor != null).length || 1);
      const snittLaunch = slag.filter((s) => s.launchAngle != null).reduce((sum, s) => sum + (s.launchAngle ?? 0), 0) / (slag.filter((s) => s.launchAngle != null).length || 1);
      const snittClubPath = slag.filter((s) => s.clubPath != null).reduce((sum, s) => sum + (s.clubPath ?? 0), 0) / (slag.filter((s) => s.clubPath != null).length || 1);
      const gyldigeFace = slag.filter((s) => s.faceToPath != null);
      const snittFace = gyldigeFace.length > 0 ? gyldigeFace.reduce((sum, s) => sum + (s.faceToPath ?? 0), 0) / gyldigeFace.length : null;
      const gyldigeSpin = slag.filter((s) => s.spinRate != null);
      const snittSpin = gyldigeSpin.length > 0 ? gyldigeSpin.reduce((sum, s) => sum + (s.spinRate ?? 0), 0) / gyldigeSpin.length : null;

      clubStats[kølle] = {
        carry: Math.round(snittCarry * 10) / 10,
        clubSpeed: Math.round(snittClubSpeed * 10) / 10,
        ballSpeed: Math.round(snittBallSpeed * 10) / 10,
        smashFactor: Math.round(snittSmash * 100) / 100,
        launchAngle: Math.round(snittLaunch * 10) / 10,
        clubPath: Math.round(snittClubPath * 10) / 10,
        faceToPath: snittFace != null ? Math.round(snittFace * 10) / 10 : null,
        spinRate: snittSpin != null ? Math.round(snittSpin) : null,
      };

      // Spredning i lengde (standardavvik på carry)
      const varians = gyldigeCarry.reduce((sum, s) => sum + Math.pow((s.carryDistance ?? 0) - snittCarry, 2), 0) / gyldigeCarry.length;
      const spredning = Math.sqrt(varians);
      gapKilde.push([kølle, Math.round(snittCarry * 10) / 10, Math.round(spredning * 10) / 10]);
    }

    // Sorter gapping fallende etter carry
    gapKilde.sort((a, b) => b[1] - a[1]);
    const gapping = gapKilde.length >= 3 ? beregnGappingRader(gapKilde) : STANDARD_PH17_DATA.gapping;

    return {
      sessions: sessionItems.length > 0 ? sessionItems : STANDARD_PH17_DATA.sessions,
      shots: shotsPerClub,
      clubStats,
      gapping,
      gear: STANDARD_PH17_DATA.gear,
      station: {
        ...STANDARD_PH17_DATA.station,
        spillerNavn,
      },
    };
  } catch (err) {
    console.error("Feil ved lasting av TrackMan-data:", err);
    return {
      ...STANDARD_PH17_DATA,
      station: {
        ...STANDARD_PH17_DATA.station,
        spillerNavn: brukerNavn || STANDARD_PH17_DATA.station.spillerNavn,
      },
    };
  }
}
