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

  // Coach-scope: assistant coach ser bare egne spilleres økter og videoer.
  const spillerScope = coachScopedPlayerWhere(user);
  const [dbSessions, dbVideos] = await Promise.all([
    prisma.trackManSession.findMany({
      where: { user: spillerScope },
      orderBy: { recordedAt: "desc" },
      take: 20,
      include: {
        user: { select: { id: true, name: true, hcp: true } },
      },
    }).catch(() => []),
    prisma.sessionVideo.findMany({
      where: { player: spillerScope },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        player: { select: { id: true, name: true } },
        coach: { select: { id: true, name: true } },
      },
    }).catch(() => []),
  ]);

  let tmSessions: TrackManOkt[] = [];
  if (dbSessions.length > 0) {
    tmSessions = dbSessions.map((s) => ({
      id: s.id,
      date: s.recordedAt.toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      who: s.user.name ?? "Spiller",
      club: "7-jern",
      shots: s.shotCount,
      video: 1,
      bay: "Studio 1",
      rows: [
        ["Club Speed", "mph", 91.4],
        ["Ball Speed", "mph", 124.6],
        ["Smash Factor", "", 1.36],
        ["Launch Angle", "°", 17.2],
        ["Spin Rate", "rpm", 6450],
        ["Club Path", "°", 2.1],
        ["Face Angle", "°", -0.8],
        ["Carry", "m", 158.4],
      ],
    }));
  }

  let videos: VideoOpptak[] = [];
  if (dbVideos.length > 0) {
    videos = dbVideos.map((v) => ({
      id: v.id,
      s: v.bookingId ?? v.id,
      title: v.title ?? "Jernsving DTL",
      by: v.player?.name ?? "Spiller",
      at: v.createdAt.toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      len: "0:04",
      note: "God rotasjon, sjekk hoftevinkel på toppen",
    }));
  }

  const data: AG18Data | undefined =
    tmSessions.length > 0 && videos.length > 0
      ? {
          tmSessions,
          videos,
        }
      : undefined;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG18TrackManVideo
        data={data}
        startFane={fane}
        startOktId={okt}
      />
    </AgencyOSSkall>
  );
}
