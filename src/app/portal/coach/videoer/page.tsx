/**
 * PlayerHQ Coach Videoer (/portal/coach/videoer) — hybrid-design 2026-06-17.
 *
 * Data-henting uendret. Visuell re-styling til hybrid-mønster:
 *   - Mono eyebrow + display-tittel
 *   - Videokort med forest-header, lime play-knapp, mono-meta
 */

import Link from "next/link";
import { ArrowLeft, Video } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
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
    <div className="mx-auto max-w-[430px] pb-24 pt-2 md:max-w-[860px] md:pb-8">
      {/* Tilbake */}
      <div className="mb-3 px-4 md:px-0">
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Coach
        </Link>
      </div>

      {/* Header */}
      <div className="mb-4 px-4 md:px-0">
        <h1 className="font-display text-[20px] font-bold leading-[1.06] tracking-[-0.02em] text-foreground">
          Videoer fra{" "}
          <em className="font-medium italic text-primary">Anders</em>
        </h1>
      </div>

      {/* Liste */}
      {videos.length === 0 ? (
        <div className="mx-3 rounded-xl border border-dashed border-border bg-card p-8 text-center md:mx-0">
          <Video className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="font-display text-[15px] font-semibold text-foreground">Ingen videoer ennå</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Coachen din kan dele swing-analyser, drill-demo og kamp-feedback her.
          </p>
        </div>
      ) : (
        <div className="px-3 md:px-0">
          {/* Kolonne-header */}
          <div className="mb-2 flex items-center gap-2 border-b border-border pb-2.5">
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
        </div>
      )}
    </div>
  );
}
