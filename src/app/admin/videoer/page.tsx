/** Faktisk coachingvideo-administrasjon. Studioopptak har egen inngang. */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachSkrivbarPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { CoachContent } from "@/components/admin/precision/agency-completion/CoachContent";
import { CoachingVideoManager, type CoachingVideoData } from "@/components/admin/precision/agency-completion/CoachingVideoManager";
export const dynamic = "force-dynamic";
export const metadata = { title: "Coachingvideoer · AgencyOS" };
const PAGE_SIZE = 50;
const dato = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
export default async function VideoerPage({ searchParams }: { searchParams?: Promise<{ page?: string; playerId?: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  // Samme skriverett som ticket, signert avspilling og sletting kontrollerer igjen på serveren.
  const playerScope = coachSkrivbarPlayerWhere(user);
  const videoScope = { player: playerScope };
  const query = await searchParams;
  const [players, bookings, total] = await Promise.all([
    prisma.user.findMany({ where: playerScope, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.booking.findMany({ where: { coachId: user.id, user: playerScope }, select: { id: true, userId: true, startAt: true, serviceType: { select: { name: true } } }, orderBy: { startAt: "desc" }, take: 200 }),
    prisma.sessionVideo.count({ where: videoScope }),
  ]);
  const requested = query?.page && /^\d{1,5}$/.test(query.page) ? Number(query.page) : 1;
  const page = Math.min(Math.max(1, requested), Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const rows = await prisma.sessionVideo.findMany({ where: videoScope, select: { id: true, title: true, playerId: true, coachId: true, status: true, createdAt: true, sizeBytes: true, tag: true, notes: true, player: { select: { name: true } }, coach: { select: { name: true } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE });
  const data: CoachingVideoData = { players: players.map(p => ({ id: p.id, name: p.name ?? "Spiller uten navn" })), bookings: bookings.flatMap(b => b.userId ? [{ id: b.id, playerId: b.userId, label: `${dato.format(b.startAt)} · ${b.serviceType.name}` }] : []), total, page, pageSize: PAGE_SIZE, initialPlayerId: players.some(p => p.id === query?.playerId) ? query!.playerId! : "", videos: rows.map(v => ({ id: v.id, title: v.title, playerId: v.playerId, playerName: v.player.name ?? "Spiller uten navn", coachName: v.coach.name ?? "Coach", status: v.status, createdLabel: dato.format(v.createdAt), sizeLabel: v.sizeBytes == null ? null : `${(v.sizeBytes / (1024 * 1024)).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} MB`, tag: v.tag, notes: v.notes, canConfirm: v.coachId === user.id && v.status === "PROCESSING", canDelete: v.status === "READY" })) };
  return <AgencyOSSkall navn={user.name ?? "Coach"}><CoachContent><CoachingVideoManager data={data} /></CoachContent></AgencyOSSkall>;
}
