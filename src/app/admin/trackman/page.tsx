/**
 * TrackMan og video — AG-18 i Precision Athletics (/admin/trackman).
 *
 * Én samlet adresse for TrackMan og videoanalyse:
 * 1. TrackMan-økter på tvers av spillere med radarmetrikker og avspiller
 * 2. Videogalleri for analyse og deling
 * 3. Studio 1 & 2 to-kameraoppsett med foreldresamtykkesjekk
 *
 * Erstatter Train-lock-skallet (V2Shell/TL) med Precision Athletics (AgencyOSSkall og AG18TrackManVideo).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { formaterVarighet, miljoEtikett, oppsummerOkt } from "@/lib/trackman/okt-oppsummering";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import {
  AG18TrackManVideo,
  type AG18Data,
  type TrackManOkt,
  type VideoOpptak,
} from "@/components/admin/precision/AG18TrackManVideo";

export const dynamic = "force-dynamic";
export const metadata = { title: "TrackMan og video · AgencyOS" };

export default async function AdminTrackmanPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string; okt?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane, okt } = await searchParams;

  const spillerVakt = coachScopedPlayerWhere(user);

  const [dbSessions, dbVideos] = await Promise.all([
    prisma.trackManSession
      .findMany({
        where: { user: spillerVakt },
        orderBy: { recordedAt: "desc" },
        take: 20,
        include: {
          user: { select: { id: true, name: true } },
          shots: {
            select: {
              club: true,
              outlier: true,
              clubSpeed: true,
              ballSpeed: true,
              smashFactor: true,
              launchAngle: true,
              spinRate: true,
              clubPath: true,
              faceAngle: true,
              carryDistance: true,
            },
          },
        },
      })
      .catch(() => []),
    prisma.sessionVideo
      .findMany({
        where: { player: spillerVakt },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          player: { select: { id: true, name: true } },
          coach: { select: { id: true, name: true } },
        },
      })
      .catch(() => []),
  ]);

  const dato = (d: Date) =>
    d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });

  const tmSessions: TrackManOkt[] = dbSessions.map((s) => {
    const sammendrag = oppsummerOkt(s.shots);
    return {
      id: s.id,
      date: dato(s.recordedAt),
      who: s.user.name ?? "Spiller",
      club: sammendrag.club,
      shots: s.shotCount,
      video: null,
      bay: miljoEtikett(s.environment),
      rows: sammendrag.rows,
    };
  });

  const videos: VideoOpptak[] = dbVideos.map((v) => ({
    id: v.id,
    s: v.bookingId ?? v.id,
    title: v.title,
    player: v.player?.name ?? "Spiller",
    by: v.coach?.name ?? null,
    at: dato(v.createdAt),
    len: formaterVarighet(v.durationSec),
    note: v.notes ?? undefined,
  }));

  const data: AG18Data = { tmSessions, videos };
  const tilstand = tmSessions.length === 0 && videos.length === 0 ? "tom" : "data";

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG18TrackManVideo
        tilstand={tilstand}
        data={data}
        startFane={fane}
        startOktId={okt}
      />
    </AgencyOSSkall>
  );
}
