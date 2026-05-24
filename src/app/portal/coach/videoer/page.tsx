import { Video } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { PlayerVideoCard } from "./player-video-card";

export default async function VideoerPage() {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });

  const videos = await prisma.sessionVideo.findMany({
    where: { playerId: user.id, status: "READY" },
    include: { coach: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:pb-0">
      <PageHeader
        eyebrow="PlayerHQ · Coach · Videoer"
        titleLead="Coaching-"
        titleItalic="videoer"
        titleTrail="fra coachen din"
        sub={`${videos.length} videoer. Klikk for å åpne i ny fane.`}
      />

      {videos.length === 0 ? (
        <EmptyState
          icon={Video}
          titleItalic="Ingen videoer"
          titleTrail="ennå"
          sub="Coachen din kan dele swing-analyser, drill-demo og kamp-feedback her."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <PlayerVideoCard
              key={v.id}
              id={v.id}
              title={v.title}
              tag={v.tag}
              notes={v.notes}
              createdAt={v.createdAt}
              coachName={v.coach.name}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
