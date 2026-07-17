/**
 * AgencyOS · Coaching-videoer — v2 (flyttet ut av (legacy) 2026-07-17, samme URL).
 * V2Shell leverer chrome-en (IkonRail/BunnNav), AdminVideoerV2 rendrer
 * innholds-stacken.
 *
 * Auth + dataloader er uendret fra den gamle skjermen:
 *   - prisma.user (PLAYER) → spillerliste for opplastingsskjemaet
 *   - prisma.sessionVideo (ADMIN: alle · COACH: egne) → videoliste + KPI-er
 * All mapping til AdminVideoerV2Data skjer her (serverside) så
 * klientkomponenten er ren presentasjon. Ingen fabrikerte tall.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminVideoerV2,
  type AdminVideoerV2Data,
} from "@/components/admin/v2/AdminVideoerV2";

export default async function VideoerPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [spillere, videos] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.sessionVideo.findMany({
      where: user.role === "ADMIN" ? {} : { coachId: user.id },
      include: {
        player: { select: { id: true, name: true } },
        coach: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const totalBytes = videos.reduce((s, v) => s + Number(v.sizeBytes ?? 0), 0);
  const totalGb = totalBytes / 1024 / 1024 / 1024;
  const naa = new Date();
  const syvDagerSiden = new Date(naa);
  syvDagerSiden.setDate(syvDagerSiden.getDate() - 7);
  const sisteUke = videos.filter((v) => v.createdAt >= syvDagerSiden).length;
  const uniqueSpillere = new Set(videos.map((v) => v.player.id)).size;

  const data: AdminVideoerV2Data = {
    kpis: {
      totalt: videos.length,
      sisteUke,
      unikeSpillere: uniqueSpillere,
      lagring: `${totalGb.toFixed(1).replace(".", ",")} GB`,
    },
    spillere: spillere.map((s) => ({ id: s.id, name: s.name })),
    videoer: videos.map((v) => ({
      id: v.id,
      title: v.title,
      tag: v.tag,
      status: v.status,
      dato: v.createdAt.toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "short",
      }),
      playerName: v.player.name,
      playerId: v.player.id,
      coachName: v.coach.name,
      storrelse: v.sizeBytes
        ? `${(Number(v.sizeBytes) / 1024 / 1024).toFixed(0)} MB`
        : null,
      canDelete: user.role === "ADMIN" || v.coach.name === user.name,
    })),
  };

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <AdminVideoerV2 data={data} />
    </V2Shell>
  );
}
