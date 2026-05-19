// Live Session Logger — fullscreen mobil-først.
// Implementasjon av prototypen i public/design/live-session-logger/index.html (iPhone 1).
// Dummy-data foreløpig — kobles mot Prisma i senere iterasjon.

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { LiveActiveClient } from "./live-active-client";

type Discipline = "SLAG" | "TEK" | "FYS";

export type LiveDrillSet = {
  id: string;
  forrigeReps: number;
  forrigeFase: string;
  reps: number | null;
  done: boolean;
};

export type LiveDrill = {
  id: string;
  index: number;
  total: number;
  name: string;
  discipline: Discipline;
  ghostPills: string[];
  fase: string;
  omrade: string;
  belastning: string;
  malProsent: number;
  format: string;
  totalSets: number;
  completedSets: number;
  sets: LiveDrillSet[];
  expanded: boolean;
};

export type LiveSessionData = {
  sessionId: string;
  spillerNavn: string;
  ukedag: string;
  fase: string;
  varighetMin: number;
  varighetTekst: string;
  totalReps: number;
  totalDrills: number;
  completedDrills: number;
  drills: LiveDrill[];
};

export default async function LiveActivePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });
  const { sessionId } = await params;

  // Eksempel-data som speiler prototype-HTML. Erstattes med Prisma-uttrekk senere.
  const data: LiveSessionData = {
    sessionId,
    spillerNavn: "Markus R.P.",
    ukedag: "Onsdag",
    fase: "CS70",
    varighetMin: 90,
    varighetTekst: "12:34",
    totalReps: 247,
    totalDrills: 6,
    completedDrills: 1,
    drills: [
      {
        id: "d1",
        index: 1,
        total: 6,
        name: "Pitch 50—100m, lav trajectory",
        discipline: "SLAG",
        ghostPills: ["CS70", "RANGE M4"],
        fase: "CS70",
        omrade: "Range M4",
        belastning: "Medium",
        malProsent: 70,
        format: "Blokk",
        totalSets: 5,
        completedSets: 1,
        expanded: true,
        sets: [
          { id: "s1", forrigeReps: 10, forrigeFase: "CS72", reps: 10, done: true },
          { id: "s2", forrigeReps: 10, forrigeFase: "CS70", reps: null, done: false },
          { id: "s3", forrigeReps: 10, forrigeFase: "CS70", reps: null, done: false },
          { id: "s4", forrigeReps: 10, forrigeFase: "CS70", reps: null, done: false },
          { id: "s5", forrigeReps: 10, forrigeFase: "CS70", reps: null, done: false },
        ],
      },
      {
        id: "d2",
        index: 2,
        total: 6,
        name: "Iron-progresjon CS70 → CS80",
        discipline: "TEK",
        ghostPills: ["90 MIN", "240 REPS"],
        fase: "CS70",
        omrade: "Range M4",
        belastning: "Medium",
        malProsent: 70,
        format: "Blokk",
        totalSets: 4,
        completedSets: 0,
        expanded: false,
        sets: [],
      },
      {
        id: "d3",
        index: 3,
        total: 6,
        name: "Putting 0—3m blokk",
        discipline: "SLAG",
        ghostPills: ["30 MIN", "100 REPS"],
        fase: "CS70",
        omrade: "Green",
        belastning: "Lav",
        malProsent: 80,
        format: "Blokk",
        totalSets: 3,
        completedSets: 0,
        expanded: false,
        sets: [],
      },
    ],
  };

  return <LiveActiveClient data={data} />;
}
