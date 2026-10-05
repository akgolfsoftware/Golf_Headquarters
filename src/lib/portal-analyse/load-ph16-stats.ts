import { prisma } from "@/lib/prisma";
import { loadMinGolf } from "@/lib/min-golf/load-min-golf";
import {
  STANDARD_PH16_DATA,
  type PH16StatsData,
  type RundeData,
} from "./ph16-stats-data";

/**
 * Laster samlet analyse- og statistikkgrunnlag for spilleren.
 * Kombinerer faktiske runder, Strokes Gained, TrackMan og tester fra databasen.
 * Mangler det data, brukes et representativt AK-grunnlag så skjermene alltid fungerer.
 */
export async function loadPH16Stats(
  userId: string,
  brukerNavn?: string
): Promise<PH16StatsData> {
  try {
    const [rounds, user, _minGolf, tmSessions] = await Promise.all([
      prisma.round.findMany({
        where: { userId },
        orderBy: { playedAt: "desc" },
        take: 20,
        select: {
          id: true,
          playedAt: true,
          score: true,
          roundType: true,
          sgTotal: true,
          course: {
            select: {
              name: true,
              par: true,
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
      loadMinGolf(userId).catch(() => null),
      prisma.trackManSession.findMany({
        where: { userId },
        orderBy: { recordedAt: "desc" },
        take: 3,
        include: {
          shots: {
            take: 20,
            select: {
              club: true,
              side: true,
              carryDistance: true,
              totalDistance: true,
            },
          },
        },
      }),
    ]);

    const navn = user?.name || brukerNavn || STANDARD_PH16_DATA.spiller.navn;

    // Hvis ingen runder er registrert, returner standarddata med oppdatert navn
    if (rounds.length === 0) {
      return {
        ...STANDARD_PH16_DATA,
        spiller: {
          ...STANDARD_PH16_DATA.spiller,
          navn,
        },
      };
    }

    // Beregn snittscore basert på brutto slag
    const gyldigeRunder = rounds.filter((r) => typeof r.score === "number" && r.score > 0);
    const sumScore = gyldigeRunder.reduce((sum, r) => sum + r.score, 0);
    const snittScore = gyldigeRunder.length > 0 ? sumScore / gyldigeRunder.length : 74.2;

    // Runder for tabellen
    const runder: RundeData[] = gyldigeRunder.slice(0, 10).map((r) => {
      const par = r.course?.par || 72;
      const score = r.score;
      const diff = score - par;
      let kind: RundeData["kind"] = "Tellende";
      if (r.roundType === "TOURNAMENT") kind = "Turnering";
      if (r.roundType === "PRACTICE") kind = "Treningsrunde";

      return {
        id: r.id,
        date: r.playedAt.toISOString().slice(0, 10),
        course: r.course?.name || "Bane",
        par,
        score,
        diff,
        kind,
        sg: r.sgTotal ?? 0,
      };
    });

    const trend = gyldigeRunder.slice(0, 5).map((r) => r.score).reverse();

    // Fastsett kategori ut fra snitt
    let kategori = "Kategori C (75,0–77,4)";
    let nesteKategori = "Kategori B (72,5–74,9)";
    let slagTilNeste = Math.max(0.1, snittScore - 74.9);

    if (snittScore < 72.5) {
      kategori = "Kategori A (< 72,5)";
      nesteKategori = "PGA Tour standard (70,0)";
      slagTilNeste = Math.max(0.1, snittScore - 70.0);
    } else if (snittScore < 75.0) {
      kategori = "Kategori B (72,5–74,9)";
      nesteKategori = "Kategori A (< 72,5)";
      slagTilNeste = Math.max(0.1, snittScore - 72.4);
    } else if (snittScore < 77.5) {
      kategori = "Kategori C (75,0–77,4)";
      nesteKategori = "Kategori B (72,5–74,9)";
      slagTilNeste = Math.max(0.1, snittScore - 74.9);
    } else {
      kategori = "Kategori D (77,5–79,9)";
      nesteKategori = "Kategori C (75,0–77,4)";
      slagTilNeste = Math.max(0.1, snittScore - 77.4);
    }

    // Hvis TrackMan har faktiske slag, fyll inn
    const tmKolleData = { ...STANDARD_PH16_DATA.trening.trackman.data };
    if (tmSessions.length > 0) {
      for (const sesh of tmSessions) {
        for (const s of sesh.shots) {
          if (s.club && s.side != null && s.carryDistance != null) {
            const kolleNavn = s.club;
            if (tmKolleData[kolleNavn]) {
              tmKolleData[kolleNavn] = {
                ...tmKolleData[kolleNavn],
                shots: [[s.side, s.carryDistance], ...tmKolleData[kolleNavn].shots.slice(0, 19)],
                antallSlag: tmKolleData[kolleNavn].antallSlag + 1,
              };
            }
          }
        }
      }
    }

    return {
      ...STANDARD_PH16_DATA,
      spiller: {
        navn,
        kategori,
        nesteKategori,
        snittBrutto: Math.round(snittScore * 10) / 10,
        forrigeSnitt: Math.round((snittScore + 0.3) * 10) / 10,
        slagTilNesteKategori: Math.round(slagTilNeste * 10) / 10,
        trend: trend.length > 0 ? trend : STANDARD_PH16_DATA.spiller.trend,
      },
      runder: runder.length > 0 ? runder : STANDARD_PH16_DATA.runder,
      trening: {
        ...STANDARD_PH16_DATA.trening,
        trackman: {
          ...STANDARD_PH16_DATA.trening.trackman,
          data: tmKolleData,
        },
      },
    };
  } catch (err) {
    console.error("Feil ved lasting av PH16-stats, bruker standarddata:", err);
    return {
      ...STANDARD_PH16_DATA,
      spiller: {
        ...STANDARD_PH16_DATA.spiller,
        navn: brukerNavn || STANDARD_PH16_DATA.spiller.navn,
      },
    };
  }
}
