/**
 * PH-21 Innboks · Videoer (/portal/coach/videoer) i Precision Athletics.
 * Spillerens egne videoer med status READY, nyeste først.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getSignedVideoUrl } from "@/lib/storage/video";
import { innboksKontekst } from "@/lib/portal-okt/innboks-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Ramme, PH21Videoer } from "@/components/portal/precision/PH21Innboks";

export const dynamic = "force-dynamic";
export const metadata = { title: "Videoer · PlayerHQ" };

const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });
const varighet = (sek: number | null) => (sek == null || sek <= 0 ? "—" : `${Math.floor(sek / 60)}:${String(sek % 60).padStart(2, "0")}`);

export default async function CoachVideoerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const [ctx, videoer] = await Promise.all([
    innboksKontekst(user.id),
    prisma.sessionVideo.findMany({
      where: { playerId: user.id, status: "READY" },
      include: { coach: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ctx.uleste}>
      <PH21Ramme aktiv="vid" coachNavn={ctx.coachNavn}>
        <PH21Videoer hentUrl={getSignedVideoUrl} videoer={videoer.map((v) => ({ id: v.id, tittel: v.title, coach: v.coach.name, dato: DATO.format(v.createdAt).replaceAll("/", "."), varighet: varighet(v.durationSec), bilde: v.thumbnailUrl }))} />
      </PH21Ramme>
    </PlayerHQSkall>
  );
}
