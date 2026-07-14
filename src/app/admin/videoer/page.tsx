/**
 * AgencyOS — Coaching-videoer (`/admin/videoer`), v2.
 * Port av `(legacy)/videoer/page.tsx` + `video-upload-form.tsx` +
 * `video-card.tsx` (2026-07-14, AgencyOS Bølge 3.10) — samme
 * `SessionVideo`-datamodell og `uploadVideo`/`getSignedVideoUrl`/
 * `deleteVideo`-kontrakt fra `@/lib/storage/video` (delt, uendret).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminVideoerV2, type AdminVideoV2Row } from "@/components/admin/v2/AdminVideoerV2";

export const dynamic = "force-dynamic";

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

  const rader: AdminVideoV2Row[] = videos.map((v) => ({
    id: v.id,
    title: v.title,
    tag: v.tag,
    status: v.status,
    datoTekst: v.createdAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short" }),
    storrelseTekst: v.sizeBytes ? `${(Number(v.sizeBytes) / 1024 / 1024).toFixed(0)} MB` : null,
    spillerNavn: v.player.name,
    spillerId: v.player.id,
    coachNavn: v.coach.name,
    kanSlette: user.role === "ADMIN" || v.coach.name === user.name,
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminVideoerV2
        totalt={videos.length}
        sisteUke={sisteUke}
        unikeSpillere={uniqueSpillere}
        lagringGbTekst={`${totalGb.toFixed(1)} GB`}
        spillere={spillere.map((s) => ({ id: s.id, name: s.name }))}
        videoer={rader}
      />
    </V2Shell>
  );
}
