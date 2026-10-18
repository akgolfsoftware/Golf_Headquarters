import { prisma } from "@/lib/prisma";
import { type PH17TrackManData, type TrackManSessionItem } from "./ph17-trackman-data";
import { beregnTrackManKoller } from "./trackman-measurements";

const dato = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });
const tom = (navn: string, state: "tom" | "feil" = "tom"): PH17TrackManData => ({
  state, sessions: [], shots: {}, clubStats: {}, gapping: [], gear: [], sessionData: {},
  station: { club: "", spillerNavn: navn, rows: [] },
});

/** Kun innlogget spiller sine importerte målinger. Databasefeil gir feiltilstand, aldri demotall. */
export async function loadPH17TrackMan(userId: string, brukerNavn = ""): Promise<PH17TrackManData> {
  try {
    const sessions = await prisma.trackManSession.findMany({
      where: { userId }, orderBy: { recordedAt: "desc" }, take: 10,
      select: {
        id: true, recordedAt: true,
        shots: { orderBy: { shotNumber: "asc" }, select: {
          club: true, side: true, carryDistance: true, clubSpeed: true, ballSpeed: true,
          smashFactor: true, launchAngle: true, clubPath: true, faceToPath: true, spinRate: true,
        } },
      },
    });
    if (!sessions.length) return tom(brukerNavn);
    const sessionItems: TrackManSessionItem[] = sessions.map((session) => ({
      id: session.id, date: dato.format(session.recordedAt), bay: "",
      shots: session.shots.length,
      clubs: [...new Set(session.shots.map((shot) => shot.club).filter((club): club is string => Boolean(club?.trim())))],
      title: "TrackMan-økt",
    }));
    const aggregate = beregnTrackManKoller(sessions.flatMap((session) => session.shots));
    const sessionData: NonNullable<PH17TrackManData["sessionData"]> = {};
    for (const session of sessions) {
      const measured = beregnTrackManKoller(session.shots);
      sessionData[session.id] = { shots: measured.shots, clubStats: measured.clubStats };
    }
    return {
      state: "data", sessions: sessionItems, shots: aggregate.shots, clubStats: aggregate.clubStats,
      gapping: aggregate.gapping, gear: [], sessionData,
      station: { club: "", spillerNavn: brukerNavn, rows: [] },
    };
  } catch {
    return tom(brukerNavn, "feil");
  }
}
