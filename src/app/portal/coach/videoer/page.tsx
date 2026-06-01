import { Video } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { PlayerVideoCard } from "./player-video-card";

export const dynamic = "force-dynamic";

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
    <div className="mx-auto max-w-[430px] space-y-5 px-4 pb-20 md:pb-8">
      <PlayerHero
        eyebrow="PlayerHQ · Coach · Videoer"
        titleLead="Coaching-"
        titleItalic="videoer"
        titleTrail="fra coachen din"
      />

      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
          Alle videoer
        </span>
        <span className="font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
          {videos.length}
        </span>
        <span className="ml-auto font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Åpnes i ny fane
        </span>
      </div>

      {videos.length === 0 ? (
        <EmptyState
          icon={Video}
          titleItalic="Ingen videoer"
          titleTrail="ennå"
          sub="Coachen din kan dele swing-analyser, drill-demo og kamp-feedback her."
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
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
