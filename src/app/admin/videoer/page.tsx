import Link from "next/link";
import { Video, Upload } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { VideoUploadForm } from "./video-upload-form";
import { VideoCard } from "./video-card";

export default async function VideoerPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [spillere, videos] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.sessionVideo.findMany({
      where:
        user.role === "ADMIN"
          ? {}
          : { coachId: user.id },
      include: {
        player: { select: { id: true, name: true } },
        coach: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Coaching-videoer"
        titleLead="Last opp og"
        titleItalic="del"
        titleTrail="med spillerne"
        sub={`${videos.length} videoer totalt. Maks 500 MB per video — mp4, mov eller webm.`}
      />

      <VideoUploadForm spillere={spillere} />

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Opplastede videoer
        </h2>

        {videos.length === 0 ? (
          <EmptyState
            icon={Video}
            titleItalic="Ingen videoer"
            titleTrail="ennå"
            sub="Bruk skjemaet over for å laste opp første video."
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                id={v.id}
                title={v.title}
                tag={v.tag}
                status={v.status}
                createdAt={v.createdAt}
                playerName={v.player.name}
                playerId={v.player.id}
                coachName={v.coach.name}
                sizeBytes={v.sizeBytes}
                canDelete={user.role === "ADMIN" || v.coach.name === user.name}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
